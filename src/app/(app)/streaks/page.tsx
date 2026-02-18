'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { STREAK_MILESTONES } from '@/lib/utils/constants';
import { getStreakTier } from '@/lib/utils/streaks';
import type { Streak, DailyCheckin } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Milestone badge config
// ---------------------------------------------------------------------------

const MILESTONE_BADGES: Record<
  number,
  { label: string; icon: string; description: string }
> = {
  7: { label: '1 Week', icon: '7', description: 'First full week locked in' },
  14: { label: '2 Weeks', icon: '14', description: 'Two weeks of consistency' },
  21: { label: '21 Days', icon: '21', description: 'Habit formed' },
  30: { label: '1 Month', icon: '30', description: 'A full month of discipline' },
  60: { label: '2 Months', icon: '60', description: 'Elite territory' },
  90: { label: '90 Days', icon: '90', description: 'Unshakeable' },
};

// ---------------------------------------------------------------------------
// Tier colors
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#C9A84C',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

// ---------------------------------------------------------------------------
// Heatmap helpers
// ---------------------------------------------------------------------------

const WEEKS_TO_SHOW = 18;
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface HeatmapDay {
  date: Date;
  dateISO: string;
  hasMorning: boolean;
  hasEvening: boolean;
  dayRating: number | null;
}

function buildHeatmapGrid(checkins: DailyCheckin[]): HeatmapDay[][] {
  const today = new Date();
  const totalDays = WEEKS_TO_SHOW * 7;
  const startDate = startOfWeek(subDays(today, totalDays - 1), {
    weekStartsOn: 1,
  });

  // Index check-ins by date
  const checkinMap = new Map<string, DailyCheckin>();
  for (const ci of checkins) {
    checkinMap.set(ci.checkin_date, ci);
  }

  const columns: HeatmapDay[][] = [];
  let currentDate = startDate;

  for (let week = 0; week < WEEKS_TO_SHOW; week++) {
    const column: HeatmapDay[] = [];
    for (let day = 0; day < 7; day++) {
      const dateISO = format(currentDate, 'yyyy-MM-dd');
      const ci = checkinMap.get(dateISO);

      column.push({
        date: new Date(currentDate),
        dateISO,
        hasMorning: !!ci?.morning_completed_at,
        hasEvening: !!ci?.evening_completed_at,
        dayRating: ci?.day_rating ?? null,
      });

      currentDate = new Date(currentDate.getTime() + 86400000);
    }
    columns.push(column);
  }

  return columns;
}

function getHeatmapColor(day: HeatmapDay): string {
  const isFuture = day.date > new Date();
  if (isFuture) return '#141414';

  if (day.hasMorning && day.hasEvening) return 'rgba(201, 168, 76, 0.9)';
  if (day.hasMorning || day.hasEvening) return 'rgba(201, 168, 76, 0.45)';
  return '#1A1A1A';
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function StreaksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<Streak | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Load streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setStreakData(streak);

      // Load checkins for heatmap (last ~4.5 months)
      const startDate = format(
        subDays(new Date(), WEEKS_TO_SHOW * 7),
        'yyyy-MM-dd'
      );

      const { data: dailyCheckins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('checkin_date', startDate)
        .order('checkin_date', { ascending: true });

      setCheckins(dailyCheckins || []);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const heatmapGrid = useMemo(() => buildHeatmapGrid(checkins), [checkins]);

  const tier = streakData ? getStreakTier(streakData.current_streak) : 'bronze';
  const tierColor = TIER_COLORS[tier];

  // Determine which milestones are achieved
  const achievedMilestones = STREAK_MILESTONES.filter(
    (m) => (streakData?.longest_streak ?? 0) >= m
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-[#2A2A2A]"
          style={{ borderTopColor: '#C9A84C' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="text-[#8A8578] text-sm font-sans mb-6 flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </motion.button>

        <h1 className="font-display text-3xl text-[#F5F0E8]">
          Your Streak
        </h1>
      </div>

      {/* Large Streak Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="flex flex-col items-center py-8"
      >
        <motion.div
          className="w-32 h-32 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: tierColor,
            boxShadow: `0 0 32px ${tierColor}20`,
          }}
          animate={{
            boxShadow: [
              `0 0 16px ${tierColor}10`,
              `0 0 32px ${tierColor}30`,
              `0 0 16px ${tierColor}10`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-center">
            <span
              className="font-display text-5xl font-bold"
              style={{ color: tierColor }}
            >
              {streakData?.current_streak ?? 0}
            </span>
          </div>
        </motion.div>
        <p className="mt-3 text-[#8A8578] font-sans text-sm">
          day{(streakData?.current_streak ?? 0) !== 1 ? 's' : ''} locked in
        </p>
        <p
          className="mt-1 font-sans text-xs font-semibold uppercase tracking-wider"
          style={{ color: tierColor }}
        >
          {tier} tier
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-10">
        {[
          {
            label: 'Current',
            value: streakData?.current_streak ?? 0,
          },
          {
            label: 'Longest',
            value: streakData?.longest_streak ?? 0,
          },
          {
            label: 'Total Check-ins',
            value: streakData?.total_checkins ?? 0,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center"
          >
            <p className="text-[#C9A84C] font-display text-2xl font-bold">
              {stat.value}
            </p>
            <p className="text-[#8A8578] font-sans text-xs mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Calendar Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-5 mb-10"
      >
        <h2 className="font-display text-lg text-[#F5F0E8] mb-4">
          Activity
        </h2>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 overflow-x-auto">
          {/* Day labels */}
          <div className="flex">
            <div className="flex flex-col gap-[3px] mr-2 mt-0">
              {DAYS_OF_WEEK.map((day, i) => (
                <div
                  key={day}
                  className="h-[14px] flex items-center justify-end"
                >
                  {i % 2 === 0 ? (
                    <span className="text-[10px] text-[#8A8578] font-sans">
                      {day}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {heatmapGrid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <motion.div
                      key={day.dateISO}
                      className="w-[14px] h-[14px] rounded-[3px] cursor-pointer"
                      style={{ backgroundColor: getHeatmapColor(day) }}
                      whileHover={{ scale: 1.5 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center gap-3"
            >
              <p className="text-[#F5F0E8] font-sans text-xs">
                {format(
                  typeof hoveredDay.dateISO === 'string'
                    ? parseISO(hoveredDay.dateISO)
                    : hoveredDay.date,
                  'MMM d, yyyy'
                )}
              </p>
              <div className="flex gap-2">
                {hoveredDay.hasMorning && (
                  <span className="text-[10px] font-sans text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
                    Morning
                  </span>
                )}
                {hoveredDay.hasEvening && (
                  <span className="text-[10px] font-sans text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
                    Evening
                  </span>
                )}
                {!hoveredDay.hasMorning && !hoveredDay.hasEvening && (
                  <span className="text-[10px] font-sans text-[#8A8578]">
                    {hoveredDay.date > new Date() ? 'Upcoming' : 'No check-in'}
                  </span>
                )}
                {hoveredDay.dayRating && (
                  <span className="text-[10px] font-sans text-[#8A8578]">
                    Rating: {hoveredDay.dayRating}/10
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center gap-4 justify-end">
            <span className="text-[10px] text-[#8A8578] font-sans">Less</span>
            {[
              '#1A1A1A',
              'rgba(201, 168, 76, 0.2)',
              'rgba(201, 168, 76, 0.45)',
              'rgba(201, 168, 76, 0.9)',
            ].map((color, i) => (
              <div
                key={i}
                className="w-[12px] h-[12px] rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[10px] text-[#8A8578] font-sans">More</span>
          </div>
        </div>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-5"
      >
        <h2 className="font-display text-lg text-[#F5F0E8] mb-4">
          Milestones
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {STREAK_MILESTONES.map((milestone) => {
            const badge = MILESTONE_BADGES[milestone];
            const isAchieved = achievedMilestones.includes(milestone);

            return (
              <motion.div
                key={milestone}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + milestone * 0.01 }}
                className={`
                  flex flex-col items-center p-4 rounded-xl border
                  ${
                    isAchieved
                      ? 'bg-[#C9A84C]/5 border-[#C9A84C]/30'
                      : 'bg-[#1A1A1A] border-[#2A2A2A] opacity-40'
                  }
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 text-sm font-bold font-sans
                    ${
                      isAchieved
                        ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                        : 'bg-[#2A2A2A] text-[#8A8578]'
                    }
                  `}
                >
                  {badge?.icon}
                </div>
                <p
                  className={`
                    font-sans text-xs font-semibold
                    ${isAchieved ? 'text-[#F5F0E8]' : 'text-[#8A8578]'}
                  `}
                >
                  {badge?.label}
                </p>
                <p className="font-sans text-[10px] text-[#8A8578] mt-0.5 text-center">
                  {badge?.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
