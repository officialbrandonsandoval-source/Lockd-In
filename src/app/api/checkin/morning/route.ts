import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/utils/streaks';
import { getTodayISO } from '@/lib/utils/dates';
import type { PriorityItem } from '@/lib/supabase/types';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { priorities, intention } = body as {
      priorities: string[];
      intention: string;
    };

    // Validate
    if (
      !priorities ||
      !Array.isArray(priorities) ||
      priorities.length !== 3 ||
      priorities.some((p) => !p.trim())
    ) {
      return NextResponse.json(
        { error: 'Please provide exactly 3 non-empty priorities.' },
        { status: 400 }
      );
    }

    if (!intention || !intention.trim()) {
      return NextResponse.json(
        { error: 'Please provide an intention for today.' },
        { status: 400 }
      );
    }

    const todayISO = getTodayISO();

    // Build priority items
    const morningPriorities: PriorityItem[] = priorities.map((text) => ({
      text: text.trim(),
      completed: false,
    }));

    // Check if a check-in already exists for today
    const { data: existingCheckin } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', todayISO)
      .single();

    let checkinId: string;

    if (existingCheckin) {
      // Update existing check-in
      const { data: updated, error: updateError } = await supabase
        .from('daily_checkins')
        .update({
          morning_priorities: morningPriorities,
          morning_intention: intention.trim(),
          morning_completed_at: new Date().toISOString(),
        })
        .eq('id', existingCheckin.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('[morning-checkin] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update check-in.' },
          { status: 500 }
        );
      }

      checkinId = updated.id;
    } else {
      // Create new check-in
      const { data: created, error: createError } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          checkin_date: todayISO,
          morning_priorities: morningPriorities,
          morning_intention: intention.trim(),
          morning_completed_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError) {
        console.error('[morning-checkin] Create error:', createError);
        return NextResponse.json(
          { error: 'Failed to create check-in.' },
          { status: 500 }
        );
      }

      checkinId = created.id;
    }

    // Update streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (streakData) {
      const updatedStreak = calculateStreak(
        streakData.last_checkin_date,
        streakData.current_streak,
        streakData.longest_streak,
        streakData.total_checkins
      );

      await supabase
        .from('streaks')
        .update({
          current_streak: updatedStreak.currentStreak,
          longest_streak: updatedStreak.longestStreak,
          total_checkins: updatedStreak.totalCheckins,
          last_checkin_date: todayISO,
          streak_started_at:
            updatedStreak.streakBroken || !streakData.streak_started_at
              ? new Date().toISOString()
              : streakData.streak_started_at,
        })
        .eq('id', streakData.id);
    } else {
      // Create initial streak record
      await supabase.from('streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        total_checkins: 1,
        last_checkin_date: todayISO,
        streak_started_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      checkinId,
    });
  } catch (error) {
    console.error('[morning-checkin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
