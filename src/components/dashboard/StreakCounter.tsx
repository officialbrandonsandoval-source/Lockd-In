'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

const MILESTONE_VALUES = [7, 14, 21, 30, 60, 90];

function isMilestone(streak: number): boolean {
  return MILESTONE_VALUES.includes(streak);
}

function FireIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-5.13 3.08-7.46.56-.69 1.17-1.35 1.8-1.96l.38-.37.53.28c.7.37 1.32.88 1.8 1.49.15.19.28.38.4.58.02-.42.12-.83.29-1.21.53-1.19 1.47-2.14 2.54-2.88L14.6 3l.48.66c.72.99 1.16 2.17 1.27 3.39.38-.3.8-.55 1.24-.74l.72-.3.3.72c.64 1.54.96 3.2.96 4.93 0 5.93-3.03 11.34-7.57 11.34zm-4.47-13.9C5.99 10.95 5 13.07 5 15c0 3.31 3.13 6 7 6 3.09 0 5.57-4.33 5.57-9.34 0-1.15-.15-2.28-.45-3.37-.62.37-1.16.87-1.57 1.47l-.89 1.3-.45-1.52a6.81 6.81 0 00-1.62-2.89c-.18.5-.26 1.03-.21 1.56l.12 1.33-1.09-.8a6.04 6.04 0 01-2.38-3.27c-.27.27-.53.55-.77.84l-.23.29z" />
    </svg>
  );
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
}: StreakCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayNumber, setDisplayNumber] = useState(0);
  const showMilestone = isMilestone(currentStreak);

  // Animate the number counting up
  useEffect(() => {
    if (!isInView) return;
    if (currentStreak === 0) {
      setDisplayNumber(0);
      return;
    }

    const duration = 1200; // ms
    const steps = Math.min(currentStreak, 60);
    const stepDuration = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += Math.ceil(currentStreak / steps);
      if (current >= currentStreak) {
        current = currentStreak;
        clearInterval(interval);
      }
      setDisplayNumber(current);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isInView, currentStreak]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 text-center overflow-hidden"
    >
      {/* Subtle gold radial glow behind number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-48 h-48 rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.6) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Milestone fire animation */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-2"
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <FireIcon className="w-10 h-10 text-[#C9A84C]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentStreak === 0 ? (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-4xl text-[#C9A84C] mb-3"
            >
              Day 1
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-[#E8E0D0] font-sans text-lg"
            >
              Fresh start. Let&apos;s go.
            </motion.p>
          </>
        ) : (
          <>
            <motion.p
              className="font-display text-[#C9A84C] leading-none mb-2"
              style={{ fontSize: '4rem' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{
                duration: 0.5,
                type: 'spring',
                stiffness: 150,
                damping: 12,
              }}
            >
              {displayNumber}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[#8A8578] font-sans text-sm uppercase tracking-widest mb-4"
            >
              days locked in
            </motion.p>
          </>
        )}

        {/* Longest streak */}
        {longestStreak > 0 && currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 pt-4 border-t border-[#2A2A2A]"
          >
            <p className="text-xs text-[#8A8578] font-sans">
              Longest streak:{' '}
              <span className="text-[#E8E0D0] font-medium">
                {longestStreak} days
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
