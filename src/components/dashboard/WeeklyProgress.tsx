'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface WeekDay {
  date: string; // ISO date string
  completed: boolean;
}

interface WeeklyProgressProps {
  weekData: WeekDay[];
  alignmentScore?: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getISODayIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  // getDay() returns 0=Sun, convert to 0=Mon
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return dateStr === todayStr;
}

export default function WeeklyProgress({
  weekData,
  alignmentScore,
}: WeeklyProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // Build a 7-slot array for Mon-Sun
  const slots: { completed: boolean; isToday: boolean; hasData: boolean }[] =
    DAY_LABELS.map(() => ({ completed: false, isToday: false, hasData: false }));

  weekData.forEach((day) => {
    const idx = getISODayIndex(day.date);
    if (idx >= 0 && idx < 7) {
      slots[idx] = {
        completed: day.completed,
        isToday: isToday(day.date),
        hasData: true,
      };
    }
  });

  // Also mark today if not already in data
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIdx = getISODayIndex(todayStr);
  if (todayIdx >= 0 && todayIdx < 7) {
    slots[todayIdx] = { ...slots[todayIdx], isToday: true };
  }

  const completedDays = weekData.filter((d) => d.completed).length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg text-[#F5F0E8]">This Week</h3>
        {alignmentScore !== undefined && alignmentScore !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8A8578] font-sans uppercase tracking-wider">
              Alignment
            </span>
            <span className="text-sm font-semibold text-[#C9A84C] font-sans tabular-nums">
              {Math.round(alignmentScore)}%
            </span>
          </div>
        )}
      </div>

      {/* Day indicators */}
      <div className="flex items-center justify-between gap-2">
        {slots.map((slot, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: i * 0.06, duration: 0.3, type: 'spring', stiffness: 300 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-[#8A8578] font-sans uppercase tracking-wider">
              {DAY_LABELS[i]}
            </span>
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
                ${
                  slot.completed
                    ? 'bg-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.3)]'
                    : slot.isToday
                      ? 'bg-[#2A2A2A] border-2 border-[#C9A84C]/50'
                      : 'bg-[#2A2A2A]/50'
                }
              `}
            >
              {slot.completed ? (
                <svg
                  className="w-4 h-4 text-[#0A0A0A]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : slot.isToday ? (
                <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-5 pt-4 border-t border-[#2A2A2A]"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#8A8578] font-sans">
            <span className="text-[#E8E0D0] font-medium">{completedDays}</span>{' '}
            of 7 days completed
          </p>
          {/* Progress bar */}
          <div className="w-24 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C9A84C] rounded-full"
              initial={{ width: 0 }}
              animate={
                isInView
                  ? { width: `${(completedDays / 7) * 100}%` }
                  : { width: 0 }
              }
              transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
