'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type {
  Profile,
  DailyCheckin,
  Streak,
  Blueprint,
  PriorityItem,
  Database,
} from '@/lib/supabase/types';

import StreakCounter from '@/components/dashboard/StreakCounter';
import QuickActions from '@/components/dashboard/QuickActions';
import TodayCard from '@/components/dashboard/TodayCard';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import ScriptureOfDay from '@/components/dashboard/ScriptureOfDay';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [weekCheckins, setWeekCheckins] = useState<DailyCheckin[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = getTodayISO();
      const weekDates = getWeekDates();
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: Profile | null };

      // Fetch today's checkin
      const { data: checkinData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .single() as { data: DailyCheckin | null };

      // Fetch streak
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: Streak | null };

      // Fetch active blueprint
      const { data: blueprintData } = await supabase
        .from('blueprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('version', { ascending: false })
        .limit(1)
        .single() as { data: Blueprint | null };

      // Fetch this week's checkins
      const { data: weekData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', weekStart)
        .lte('checkin_date', weekEnd) as { data: DailyCheckin[] | null };

      if (profileData) setProfile(profileData);
      if (checkinData) {
        setTodayCheckin(checkinData);
        setPriorities(checkinData.morning_priorities || []);
      }
      if (streakData) setStreak(streakData);
      if (blueprintData) setBlueprint(blueprintData);
      if (weekData) setWeekCheckins(weekData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTogglePriority = async (index: number) => {
    if (!todayCheckin) return;

    const updated = priorities.map((p, i) =>
      i === index ? { ...p, completed: !p.completed } : p
    );
    setPriorities(updated);

    const completedCount = updated.filter((p) => p.completed).length;

    await (supabase
      .from('daily_checkins') as ReturnType<typeof supabase.from>)
      .update({
        morning_priorities: updated,
        priorities_completed: completedCount,
      } as never)
      .eq('id', todayCheckin.id);
  };

  // Derived state
  const hasMorningCheckin = !!todayCheckin?.morning_completed_at;
  const hasEveningCheckin = !!todayCheckin?.evening_completed_at;
  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const firstName = profile?.full_name?.split(' ')[0] || '';

  // Build weekly data
  const weekDates = getWeekDates();
  const weekData = weekDates.map((date) => {
    const checkin = weekCheckins.find((c) => c.checkin_date === date);
    return {
      date,
      completed: !!(checkin?.morning_completed_at || checkin?.evening_completed_at),
    };
  });

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 max-w-lg mx-auto">
        <div className="space-y-6">
          {/* Greeting skeleton */}
          <div className="h-8 w-64 bg-[#1A1A1A] rounded-lg animate-pulse" />
          {/* Streak skeleton */}
          <div className="h-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
          {/* CTA skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
            <div className="h-20 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
          </div>
          {/* Priorities skeleton */}
          <div className="h-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
          {/* Weekly skeleton */}
          <div className="h-36 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 pb-24 max-w-lg mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header: Greeting + Refresh */}
        <motion.div
          variants={itemVariants}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display text-2xl text-[#E8E0D0]">
              {getGreeting()},{firstName ? ` ${firstName}` : ''}.
            </h1>
            <p className="text-sm text-[#8A8578] font-sans mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#8A8578] hover:text-[#C9A84C] hover:border-[#C9A84C]/30 transition-all disabled:opacity-50"
            aria-label="Refresh"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </motion.div>

        {/* Streak Counter */}
        <motion.div variants={itemVariants}>
          <StreakCounter
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
        </motion.div>

        {/* Quick Actions - Morning / Evening CTAs */}
        <motion.div variants={itemVariants}>
          <QuickActions
            hasMorningCheckin={hasMorningCheckin}
            hasEveningCheckin={hasEveningCheckin}
          />
        </motion.div>

        {/* Today's Priorities */}
        <motion.div variants={itemVariants}>
          <TodayCard
            priorities={priorities}
            onToggle={handleTogglePriority}
          />
        </motion.div>

        {/* Weekly Progress */}
        <motion.div variants={itemVariants}>
          <WeeklyProgress weekData={weekData} />
        </motion.div>

        {/* Scripture of the Day */}
        <motion.div variants={itemVariants}>
          <ScriptureOfDay />
        </motion.div>

        {/* View Blueprint link */}
        {blueprint && (
          <motion.div variants={itemVariants}>
            <Link href="/app/blueprint">
              <motion.div
                whileHover={{
                  borderColor: 'rgba(201, 168, 76, 0.4)',
                  boxShadow: '0 0 20px rgba(201, 168, 76, 0.08)',
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-colors">
                    <svg
                      className="w-5 h-5 text-[#C9A84C]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F5F0E8] font-sans">
                      View Your Blueprint
                    </p>
                    <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                      Your identity, purpose &amp; plan
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-[#8A8578] group-hover:text-[#C9A84C] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
