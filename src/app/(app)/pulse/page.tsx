'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import type { WeeklyPulse } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Pulse Card component
// ---------------------------------------------------------------------------

function PulseCard({
  pulse,
  index,
}: {
  pulse: WeeklyPulse;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  const weekStart = format(parseISO(pulse.week_start), 'MMM d');
  const weekEnd = format(parseISO(pulse.week_end), 'MMM d, yyyy');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-2xl overflow-hidden"
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          {/* Alignment Score */}
          <div className="flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor:
                  (pulse.alignment_score ?? 0) >= 70
                    ? '#C9A84C'
                    : (pulse.alignment_score ?? 0) >= 40
                      ? '#8A8578'
                      : '#8B2500',
              }}
            >
              <span
                className="font-display text-xl font-bold"
                style={{
                  color:
                    (pulse.alignment_score ?? 0) >= 70
                      ? '#C9A84C'
                      : (pulse.alignment_score ?? 0) >= 40
                        ? '#8A8578'
                        : '#8B2500',
                }}
              >
                {pulse.alignment_score ?? '--'}
              </span>
            </div>
          </div>

          {/* Week Info */}
          <div>
            <p className="text-[#F5F0E8] font-sans text-sm font-semibold">
              {weekStart} - {weekEnd}
            </p>
            <p className="text-[#8A8578] font-sans text-xs mt-0.5">
              Alignment Score
            </p>
          </div>
        </div>

        {/* Expand/Collapse Arrow */}
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#8A8578"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-[#2A2A2A] pt-4">
              {/* Wins Summary */}
              {pulse.wins_summary && (
                <div>
                  <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-2">
                    Wins
                  </p>
                  <div className="space-y-1.5">
                    {pulse.wins_summary.split('\n').map((win, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#2D5A27] mt-0.5 flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <p className="text-[#F5F0E8] font-sans text-sm">
                          {win}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth Areas */}
              {pulse.growth_areas && (
                <div>
                  <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-2">
                    Growth Areas
                  </p>
                  <div className="space-y-1.5">
                    {pulse.growth_areas.split('\n').map((area, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#C9A84C] mt-1 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 5v14M5 12h14"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                        <p className="text-[#F5F0E8] font-sans text-sm">
                          {area}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern Insights */}
              {pulse.pattern_insights && (
                <div>
                  <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-2">
                    Pattern Insights
                  </p>
                  <div className="bg-[#141414] rounded-xl p-4 border border-[#2A2A2A]">
                    <div className="space-y-2">
                      {pulse.pattern_insights.split('\n').map((insight, i) => (
                        <p
                          key={i}
                          className="text-[#F5F0E8] font-sans text-sm leading-relaxed"
                        >
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Week Focus */}
              {pulse.next_week_focus && (
                <div>
                  <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-2">
                    Next Week Focus
                  </p>
                  <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                    {pulse.next_week_focus.split('\n').map((line, i) => (
                      <p
                        key={i}
                        className={`font-sans text-sm ${
                          i === 0
                            ? 'text-[#F5F0E8] font-semibold'
                            : 'text-[#8A8578] mt-1'
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Scripture Encouragement */}
              {pulse.scripture_encouragement && (
                <div className="bg-[#141414] rounded-xl p-4 border border-[#2A2A2A]">
                  <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-2">
                    Scripture
                  </p>
                  <p className="text-[#C9A84C] font-display text-sm leading-relaxed italic">
                    {pulse.scripture_encouragement}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function PulsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pulses, setPulses] = useState<WeeklyPulse[]>([]);
  const [hasCurrentWeekPulse, setHasCurrentWeekPulse] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      // Load all pulses, most recent first
      const { data: weeklyPulses } = await supabase
        .from('weekly_pulses')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false });

      const allPulses = weeklyPulses || [];
      setPulses(allPulses);

      // Check if current week has a pulse
      if (allPulses.length > 0) {
        const now = new Date();
        const latestPulse = allPulses[0];
        const weekEnd = parseISO(latestPulse.week_end);
        // If the latest pulse's week_end is >= today, we have a current week pulse
        setHasCurrentWeekPulse(weekEnd >= now);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

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
          Weekly Pulse
        </h1>
        <p className="text-[#8A8578] font-sans text-sm mt-1">
          Your weekly alignment reports, powered by AI.
        </p>
      </div>

      {/* Current week notice */}
      {!hasCurrentWeekPulse && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-6 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="flex-shrink-0 mt-0.5"
            >
              <path
                d="M12 8v4l3 3"
                stroke="#C9A84C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#C9A84C"
                strokeWidth="2"
              />
            </svg>
            <div>
              <p className="text-[#F5F0E8] font-sans text-sm font-semibold">
                Pulse in progress
              </p>
              <p className="text-[#8A8578] font-sans text-xs mt-0.5">
                Your pulse will be generated Sunday evening. Keep checking in daily for the most accurate report.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pulse list */}
      {pulses.length > 0 ? (
        <div className="px-5 space-y-4">
          {pulses.map((pulse, i) => (
            <PulseCard key={pulse.id} pulse={pulse} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5"
        >
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 12h-4l-3 9L9 3l-3 9H2"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-display text-lg text-[#F5F0E8] mb-2">
              No pulses yet
            </h3>
            <p className="text-[#8A8578] font-sans text-sm max-w-xs mx-auto">
              Your first pulse will generate after a week of check-ins. Keep locking in.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
