import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEveningMessage } from '@/lib/ai/claude';
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

    // Get today's check-in
    const { data: todayCheckin } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', todayISO)
      .single();

    // Get streak info
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    // Extract morning commitments from priorities
    const morningCommitments: string[] =
      todayCheckin?.morning_priorities?.map(
        (p: { text: string }) => p.text
      ) || [];

    // Build daily activity object
    const dailyActivity: Record<string, unknown> = todayCheckin
      ? {
          morning_intention: todayCheckin.morning_intention,
          priorities: todayCheckin.morning_priorities,
          priorities_completed: todayCheckin.priorities_completed,
          wins: todayCheckin.evening_wins,
          struggles: todayCheckin.evening_struggles,
          gratitude: todayCheckin.evening_gratitude,
          day_rating: todayCheckin.day_rating,
        }
      : {};

    // Generate the evening message via Claude
    const response = await generateEveningMessage({
      blueprint: (blueprint as Record<string, unknown>) || {},
      morningCommitments,
      dailyActivity,
      streak: streak?.current_streak || 0,
      userName,
      todayDate: todayISO,
    });

    if (!response.success) {
      console.error('[evening-agent] AI generation failed:', response.error);
      return NextResponse.json(
        { error: 'Failed to generate evening message.' },
        { status: 500 }
      );
    }

    // Store the AI message in the daily check-in
    if (todayCheckin) {
      await supabase
        .from('daily_checkins')
        .update({
          ai_evening_message: response.rawText,
        })
        .eq('id', todayCheckin.id);
    }

    return NextResponse.json({
      success: true,
      message: response.data || response.rawText,
    });
  } catch (error) {
    console.error('[evening-agent] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
