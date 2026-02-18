import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMorningMessage } from '@/lib/ai/claude';
import { getTodayISO } from '@/lib/utils/dates';

export async function POST() {
  try {
    const supabase = createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const todayISO = getTodayISO();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name?.split(' ')[0] || 'King';

    // Get user's active blueprint
    const { data: blueprint } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    // Get streak info
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    // Get recent check-ins (last 3)
    const { data: recentCheckins } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(3);

    // Generate the morning message via Claude
    const response = await generateMorningMessage({
      blueprint: (blueprint as Record<string, unknown>) || {},
      streak: streak?.current_streak || 0,
      previousCheckins: (recentCheckins as Record<string, unknown>[]) || [],
      todayDate: todayISO,
      userName,
    });

    if (!response.success) {
      console.error('[morning-agent] AI generation failed:', response.error);
      return NextResponse.json(
        { error: 'Failed to generate morning message.' },
        { status: 500 }
      );
    }

    // Store the AI message in the daily check-in
    const { data: todayCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', todayISO)
      .single();

    if (todayCheckin) {
      await supabase
        .from('daily_checkins')
        .update({
          ai_morning_message: response.rawText,
        })
        .eq('id', todayCheckin.id);
    }

    return NextResponse.json({
      success: true,
      message: response.data || response.rawText,
    });
  } catch (error) {
    console.error('[morning-agent] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
