'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { PriorityItem } from '@/lib/supabase/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EveningMessage {
  evening_greeting?: string;
  commitment_review?: Array<{
    commitment: string;
    status: string;
    reflection: string;
  }>;
  wins?: string;
  growth_edge?: string;
  blueprint_connection?: string;
  scripture_or_reflection?: string;
  tomorrow_seed?: string;
  closing_word?: string;
}

interface EveningFlowProps {
  userName: string;
  morningPriorities: PriorityItem[];
  currentStreak: number;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const TOTAL_STEPS = 6;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EveningFlow({
  userName,
  morningPriorities,
  currentStreak,
}: EveningFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [prioritiesCompleted, setPrioritiesCompleted] = useState<boolean[]>(
    morningPriorities.map((p) => p.completed)
  );
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [dayRating, setDayRating] = useState<number>(0);
  const [eveningMessage, setEveningMessage] = useState<EveningMessage | null>(null);

  // Toggle priority completion
  const togglePriority = useCallback((index: number) => {
    setPrioritiesCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  // Step validation
  const canAdvance = useCallback((): boolean => {
    if (step === 1) return true; // Checkboxes can be empty
    if (step === 2) return wins.trim().length > 0;
    if (step === 3) return struggles.trim().length > 0;
    if (step === 4) return gratitude.trim().length > 0;
    if (step === 5) return dayRating >= 1 && dayRating <= 10;
    return true;
  }, [step, wins, struggles, gratitude, dayRating]);

  // Navigation
  const goNext = useCallback(async () => {
    if (!canAdvance()) return;
    setError(null);

    if (step === 5) {
      // Submit evening check-in, then fetch AI message
      setIsSubmitting(true);
      try {
        const checkinRes = await fetch('/api/checkin/evening', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priorities_completed: prioritiesCompleted,
            wins: wins.trim(),
            struggles: struggles.trim(),
            gratitude: gratitude.trim(),
            day_rating: dayRating,
          }),
        });

        if (!checkinRes.ok) {
          const data = await checkinRes.json();
          throw new Error(data.error || 'Failed to save evening check-in.');
        }

        setIsSubmitting(false);
        setDirection(1);
        setStep(6);

        // Fetch AI evening message
        setIsLoadingAI(true);
        try {
          const agentRes = await fetch('/api/agent/evening', {
            method: 'POST',
          });

          if (agentRes.ok) {
            const agentData = await agentRes.json();
            setEveningMessage(
              typeof agentData.message === 'string'
                ? JSON.parse(agentData.message)
                : agentData.message
            );
          }
        } catch {
          console.warn('[EveningFlow] Could not load AI message.');
        } finally {
          setIsLoadingAI(false);
        }
      } catch (err) {
        setIsSubmitting(false);
        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        );
      }
      return;
    }

    if (step === 6) {
      // Complete - show success then redirect
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
      return;
    }

    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, canAdvance, prioritiesCompleted, wins, struggles, gratitude, dayRating, router]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setError(null);
    setDirection(-1);
    setStep((s) => s - 1);
  }, [step]);

  // ---------------------------------------------------------------------------
  // Success overlay
  // ---------------------------------------------------------------------------
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A]"
      >
        <motion.div
          className="w-24 h-24 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0) 70%)',
          }}
          animate={{
            scale: [1, 2, 1.5],
            opacity: [0.5, 1, 0.7],
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="absolute flex flex-col items-center"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-[#F5F0E8] font-display text-xl"
        >
          Day complete.
        </motion.p>

        {/* Streak update */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-4 flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2C12 2 8.5 7 8.5 11C8.5 13.21 9.79 15.14 11.5 16.24C11.18 15.11 11.5 13.88 12.34 13.04C13.18 12.2 14.5 11.88 15.5 12.24C15.14 9.79 14 7.5 12 2ZM11.71 19C10.56 18.59 9.5 17.79 8.82 16.68C8.14 15.57 7.92 14.34 8.14 13.12C6.59 14.69 6 17.27 7.14 19.44C8.28 21.61 10.65 22.67 12.88 22.18C15.11 21.69 16.84 19.89 17.14 17.64C17.25 16.87 17.2 16.08 16.99 15.33C15.93 17.65 13.99 19.34 11.71 19Z"
              fill="#C9A84C"
            />
          </svg>
          <span className="text-[#C9A84C] font-sans text-lg font-semibold">
            {currentStreak} day streak
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-2 text-[#8A8578] font-sans text-sm"
        >
          Rest well, King. Tomorrow we go again.
        </motion.p>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2.5 pt-8 pb-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor:
                i + 1 <= step ? '#C9A84C' : '#2A2A2A',
              scale: i + 1 === step ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-5">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Priority Completion */}
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                How&apos;d today go?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                Did you complete your priorities?
              </motion.p>

              <div className="space-y-3">
                {morningPriorities.map((priority, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => togglePriority(i)}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-xl border
                      transition-all duration-200 text-left
                      ${
                        prioritiesCompleted[i]
                          ? 'bg-[#2D5A27]/10 border-[#2D5A27]/40'
                          : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        flex-shrink-0 w-6 h-6 rounded-md border-2
                        flex items-center justify-center transition-all duration-200
                        ${
                          prioritiesCompleted[i]
                            ? 'bg-[#2D5A27] border-[#2D5A27]'
                            : 'border-[#2A2A2A]'
                        }
                      `}
                    >
                      {prioritiesCompleted[i] && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="#F5F0E8"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </div>

                    {/* Priority Text */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className={`
                          flex-shrink-0 text-xs font-semibold font-sans w-5 h-5 rounded-full
                          flex items-center justify-center
                          ${
                            prioritiesCompleted[i]
                              ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                              : 'bg-[#2A2A2A] text-[#8A8578]'
                          }
                        `}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`
                          font-sans text-sm truncate
                          ${
                            prioritiesCompleted[i]
                              ? 'text-[#F5F0E8] line-through opacity-70'
                              : 'text-[#F5F0E8]'
                          }
                        `}
                      >
                        {priority.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Wins */}
          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                What was your biggest win today?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                Even small wins count. Name it.
              </motion.p>

              <motion.textarea
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="Today I..."
                rows={4}
                maxLength={500}
                className="
                  w-full bg-[#141414] text-[#F5F0E8] font-sans
                  border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm resize-none
                  placeholder:text-[#8A8578]/50
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors duration-200
                "
              />
            </motion.div>
          )}

          {/* Step 3: Struggles */}
          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                What did you struggle with?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                Honesty here builds character. No judgment.
              </motion.p>

              <motion.textarea
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                value={struggles}
                onChange={(e) => setStruggles(e.target.value)}
                placeholder="I struggled with..."
                rows={4}
                maxLength={500}
                className="
                  w-full bg-[#141414] text-[#F5F0E8] font-sans
                  border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm resize-none
                  placeholder:text-[#8A8578]/50
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors duration-200
                "
              />
            </motion.div>
          )}

          {/* Step 4: Gratitude */}
          {step === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                What are you grateful for?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                Gratitude shifts your perspective. Speak it.
              </motion.p>

              <motion.textarea
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="I'm grateful for..."
                rows={4}
                maxLength={500}
                className="
                  w-full bg-[#141414] text-[#F5F0E8] font-sans
                  border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm resize-none
                  placeholder:text-[#8A8578]/50
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors duration-200
                "
              />
            </motion.div>
          )}

          {/* Step 5: Day Rating */}
          {step === 5 && (
            <motion.div
              key="step-5"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                Rate your day.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-10"
              >
                1 is rough. 10 is exceptional. Be honest.
              </motion.p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <motion.button
                    key={n}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: n * 0.04 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDayRating(n)}
                    className={`
                      w-11 h-11 rounded-full font-sans text-sm font-semibold
                      flex items-center justify-center transition-all duration-200
                      ${
                        dayRating === n
                          ? 'bg-[#C9A84C] text-[#0A0A0A] shadow-gold'
                          : dayRating > 0 && n <= dayRating
                            ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30'
                            : 'bg-[#1A1A1A] text-[#8A8578] border border-[#2A2A2A] hover:border-[#C9A84C]/30'
                      }
                    `}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>

              {dayRating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-6 text-[#C9A84C] font-display text-lg"
                >
                  {dayRating <= 3
                    ? 'Tough day. Growth happens here.'
                    : dayRating <= 5
                      ? 'Solid. Keep pushing.'
                      : dayRating <= 7
                        ? 'Good day. Building momentum.'
                        : dayRating <= 9
                          ? 'Great day, King.'
                          : 'Legendary. You showed up fully.'}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Step 6: AI Evening Reflection */}
          {step === 6 && (
            <motion.div
              key="step-6"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-lg"
            >
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                Your evening reflection.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#8A8578] font-sans text-sm mb-6"
              >
                A word for the end of your day.
              </motion.p>

              {isLoadingAI ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="h-4 rounded bg-[#1A1A1A] shimmer-bg"
                      style={{ width: `${100 - i * 12}%` }}
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                  <p className="text-[#8A8578] text-xs font-sans mt-4">
                    Preparing your evening reflection...
                  </p>
                </div>
              ) : eveningMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-5 max-h-[60vh] overflow-y-auto"
                >
                  {/* Evening Greeting */}
                  {eveningMessage.evening_greeting && (
                    <p className="text-[#F5F0E8] font-sans text-sm leading-relaxed">
                      {eveningMessage.evening_greeting}
                    </p>
                  )}

                  {/* Commitment Review */}
                  {eveningMessage.commitment_review &&
                    eveningMessage.commitment_review.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider">
                          Commitment Review
                        </p>
                        {eveningMessage.commitment_review.map((cr, i) => (
                          <div
                            key={i}
                            className={`
                              p-3 rounded-lg border text-sm
                              ${
                                cr.status === 'completed'
                                  ? 'border-[#2D5A27]/40 bg-[#2D5A27]/5'
                                  : cr.status === 'partial'
                                    ? 'border-[#C9A84C]/30 bg-[#C9A84C]/5'
                                    : 'border-[#8B2500]/30 bg-[#8B2500]/5'
                              }
                            `}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`
                                  text-xs font-semibold font-sans uppercase
                                  ${
                                    cr.status === 'completed'
                                      ? 'text-[#2D5A27]'
                                      : cr.status === 'partial'
                                        ? 'text-[#C9A84C]'
                                        : 'text-[#8B2500]'
                                  }
                                `}
                              >
                                {cr.status}
                              </span>
                            </div>
                            <p className="text-[#F5F0E8] font-sans">
                              {cr.commitment}
                            </p>
                            <p className="text-[#8A8578] font-sans text-xs mt-1">
                              {cr.reflection}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Wins */}
                  {eveningMessage.wins && (
                    <div>
                      <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-1">
                        Wins
                      </p>
                      <p className="text-[#F5F0E8] font-sans text-sm">
                        {eveningMessage.wins}
                      </p>
                    </div>
                  )}

                  {/* Growth Edge */}
                  {eveningMessage.growth_edge && (
                    <div>
                      <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider mb-1">
                        Growth Edge
                      </p>
                      <p className="text-[#F5F0E8] font-sans text-sm">
                        {eveningMessage.growth_edge}
                      </p>
                    </div>
                  )}

                  {/* Scripture */}
                  {eveningMessage.scripture_or_reflection && (
                    <div className="bg-[#141414] rounded-xl p-4 border border-[#2A2A2A]">
                      <p className="text-[#C9A84C] font-display text-sm leading-relaxed italic">
                        {eveningMessage.scripture_or_reflection}
                      </p>
                    </div>
                  )}

                  {/* Tomorrow Seed */}
                  {eveningMessage.tomorrow_seed && (
                    <p className="text-[#8A8578] font-sans text-sm">
                      {eveningMessage.tomorrow_seed}
                    </p>
                  )}

                  {/* Closing Word */}
                  {eveningMessage.closing_word && (
                    <div className="pt-2 border-t border-[#2A2A2A]">
                      <p className="text-[#E8E0D0] font-display text-sm font-semibold">
                        {eveningMessage.closing_word}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                  <p className="text-[#8A8578] font-sans text-sm">
                    Your evening check-in has been saved. Rest well tonight.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-2"
        >
          <p className="text-center text-sm text-red-400 font-sans">
            {error}
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-6 max-w-lg mx-auto w-full">
        {step > 1 && step < 6 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={goBack}
            className="px-5 py-2.5 text-sm font-sans text-[#8A8578] hover:text-[#F5F0E8] transition-colors"
          >
            Back
          </motion.button>
        ) : (
          <div />
        )}

        <motion.button
          whileHover={canAdvance() && !isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={canAdvance() && !isSubmitting ? { scale: 0.97 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={goNext}
          disabled={!canAdvance() || isSubmitting}
          className={`
            px-7 py-3 rounded-xl font-sans text-sm font-semibold
            transition-colors duration-200
            ${
              canAdvance() && !isSubmitting
                ? 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#C9A84C]/90 shadow-gold cursor-pointer'
                : 'bg-[#2A2A2A] text-[#8A8578] cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </span>
          ) : step === 6 ? (
            'Finish & Go to Dashboard'
          ) : step === 5 ? (
            'Submit & Get Reflection'
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>
    </div>
  );
}
