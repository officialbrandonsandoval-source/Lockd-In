import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWeeklyPulse } from '@/lib/ai/claude';
import { getWeekRange, formatDate } from '@/lib/utils/dates';
import { format, getISOWeek } from 'date-fns';

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

    const now = new Date();
    const { start: weekStart, end: weekEnd } = getWeekRange(now);
    const weekStartISO = format(weekStart, 'yyyy-MM-dd');
    const weekEndISO = format(weekEnd, 'yyyy-MM-dd');
    const weekNumber = getISOWeek(now);

    // Check if pulse already exists for this week
    const { data: existingPulse } = await supabase
      .from('weekly_pulses')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', weekStartISO)
      .single();

    if (existingPulse) {
      return NextResponse.json(
        { error: 'A pulse has already been generated for this week.' },
        { status: 409 }
      );
    }

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

    // Get this week's check-ins
    const { data: weeklyCheckins } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('checkin_date', weekStartISO)
      .lte('checkin_date', weekEndISO)
      .order('checkin_date', { ascending: true });

    // Get streak info
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    // Generate weekly pulse via Claude
    const response = await generateWeeklyPulse({
      blueprint: (blueprint as Record<string, unknown>) || {},
      weeklyCheckins: (weeklyCheckins as Record<string, unknown>[]) || [],
      streak: streak?.current_streak || 0,
      weekNumber,
      userName,
      weekStartDate: formatDate(weekStart),
      weekEndDate: formatDate(weekEnd),
    });

    if (!response.success) {
      console.error('[pulse-generate] AI generation failed:', response.error);
      return NextResponse.json(
        { error: 'Failed to generate weekly pulse.' },
        { status: 500 }
      );
    }

    // Parse alignment score from AI response
    const pulseData = response.data as Record<string, unknown> | null;
    const weekScore = pulseData?.week_score as Record<string, unknown> | undefined;
    const alignmentScore = weekScore?.overall
      ? Math.round(((weekScore.overall as number) / 10) * 100)
      : null;

    // Extract fields from AI response
    const winsOfWeek = pulseData?.wins_of_the_week as string[] | undefined;
    const winsSummary = winsOfWeek?.join('\n') ?? null;

    const patternsNoticed = pulseData?.patterns_noticed as Array<Record<string, unknown>> | undefined;
    const growthAreas = patternsNoticed
      ?.filter((p) => p.impact === 'negative')
      .map((p) => `${p.pattern}: ${p.recommendation}`)
      .join('\n') ?? null;

    const patternInsights = patternsNoticed
      ?.map((p) => `[${p.impact}] ${p.pattern}: ${p.recommendation}`)
      .join('\n') ?? null;

    const nextWeekFocusData = pulseData?.next_week_focus as Record<string, unknown> | undefined;
    const nextWeekFocus = nextWeekFocusData
      ? `${nextWeekFocusData.primary_focus}\n${nextWeekFocusData.reason}`
      : null;

    const scriptureEncouragement = (pulseData?.scripture_for_the_week as string) ?? null;

    // Store in weekly_pulses table
    const { data: pulse, error: insertError } = await supabase
      .from('weekly_pulses')
      .insert({
        user_id: user.id,
        week_start: weekStartISO,
        week_end: weekEndISO,
        alignment_score: alignmentScore,
        wins_summary: winsSummary,
        growth_areas: growthAreas,
        pattern_insights: patternInsights,
        next_week_focus: nextWeekFocus,
        scripture_encouragement: scriptureEncouragement,
        full_pulse_markdown: response.rawText,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[pulse-generate] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save weekly pulse.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pulse,
    });
  } catch (error) {
    console.error('[pulse-generate] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
