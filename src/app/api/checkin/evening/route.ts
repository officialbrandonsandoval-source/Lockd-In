import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTodayISO } from '@/lib/utils/dates';

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
    const {
      priorities_completed,
      wins,
      struggles,
      gratitude,
      day_rating,
    } = body as {
      priorities_completed: boolean[];
      wins: string;
      struggles: string;
      gratitude: string;
      day_rating: number;
    };

    // Validate day rating
    if (!day_rating || day_rating < 1 || day_rating > 10) {
      return NextResponse.json(
        { error: 'Please provide a day rating between 1 and 10.' },
        { status: 400 }
      );
    }

    const todayISO = getTodayISO();

    // Get today's check-in
    const { data: todayCheckin, error: fetchError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', todayISO)
      .single();

    if (fetchError || !todayCheckin) {
      return NextResponse.json(
        { error: 'No morning check-in found for today. Please complete your morning check-in first.' },
        { status: 404 }
      );
    }

    // Update morning priorities with completion status
    const updatedPriorities = todayCheckin.morning_priorities?.map(
      (priority, index) => ({
        ...priority,
        completed: priorities_completed?.[index] ?? false,
      })
    ) ?? [];

    const completedCount = priorities_completed?.filter(Boolean).length ?? 0;

    // Update the check-in with evening data
    const { error: updateError } = await supabase
      .from('daily_checkins')
      .update({
        morning_priorities: updatedPriorities,
        priorities_completed: completedCount,
        evening_wins: wins ? [wins.trim()] : [],
        evening_struggles: struggles ? [struggles.trim()] : [],
        evening_gratitude: gratitude ? [gratitude.trim()] : [],
        day_rating,
        evening_completed_at: new Date().toISOString(),
      })
      .eq('id', todayCheckin.id);

    if (updateError) {
      console.error('[evening-checkin] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update evening check-in.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkinId: todayCheckin.id,
    });
  } catch (error) {
    console.error('[evening-checkin] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
