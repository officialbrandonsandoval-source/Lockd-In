'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PriorityInput from './PriorityInput';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MorningMessage {
  greeting?: string;
  identity_reminder?: string;
  streak_acknowledgment?: string;
  scripture_or_wisdom?: string;
  todays_focus?: string;
  commitments?: Array<{
    commitment: string;
    linked_target: string;
  }>;
  closing_charge?: string;
}

interface MorningFlowProps {
  userName: string;
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

const TOTAL_STEPS = 3;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MorningFlow({ userName }: MorningFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [priorities, setPriorities] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [morningMessage, setMorningMessage] = useState<MorningMessage | null>(null);

  // Priority helpers
  const updatePriority = useCallback((index: number, value: string) => {
    setPriorities((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  // Step validation
  const canAdvance = useCallback((): boolean => {
    if (step === 1) return priorities.every((p) => p.trim().length > 0);
    if (step === 2) return intention.trim().length > 0;
    return true;
  }, [step, priorities, intention]);

  // Navigation
  const goNext = useCallback(async () => {
    if (!canAdvance()) return;
    setError(null);

    if (step === 2) {
      // Submit check-in, then fetch AI message
      setIsSubmitting(true);
      try {
        const checkinRes = await fetch('/api/checkin/morning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priorities: priorities.map((p) => p.trim()),
            intention: intention.trim(),
          }),
        });

        if (!checkinRes.ok) {
          const data = await checkinRes.json();
          throw new Error(data.error || 'Failed to save check-in.');
        }

        setIsSubmitting(false);
        setDirection(1);
        setStep(3);

        // Fetch AI message
        setIsLoadingAI(true);
        try {
          const agentRes = await fetch('/api/agent/morning', {
            method: 'POST',
          });

          if (agentRes.ok) {
            const agentData = await agentRes.json();
            setMorningMessage(
              typeof agentData.message === 'string'
                ? JSON.parse(agentData.message)
                : agentData.message
            );
          }
        } catch {
          // AI message is optional; failing gracefully
          console.warn('[MorningFlow] Could not load AI message.');
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

    if (step === 3) {
      // Complete — show success then redirect
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2200);
      return;
    }

    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, canAdvance, priorities, intention, router]);

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
        {/* Gold burst */}
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
          className="absolute"
        >
          <svg
            width="64"
            height="64"
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
          You are locked in.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-2 text-[#8A8578] font-sans text-sm"
        >
          Go build your legacy today.
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
      <div className="flex items-center justify-center gap-3 pt-8 pb-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor:
                i + 1 <= step
                  ? '#C9A84C'
                  : '#2A2A2A',
              scale: i + 1 === step ? 1.25 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-5">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Priorities */}
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
                transition={{ delay: 0.1 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                Good morning, {userName}.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                What are your top 3 priorities today?
              </motion.p>

              <div className="flex flex-col gap-4">
                {priorities.map((val, i) => (
                  <PriorityInput
                    key={i}
                    index={i}
                    value={val}
                    onChange={(v) => updatePriority(i, v)}
                    placeholder={
                      i === 0
                        ? 'Most important priority...'
                        : i === 1
                          ? 'Second priority...'
                          : 'Third priority...'
                    }
                  />
                ))}
              </div>

              {/* FIX 7: Priority count helper — shows how many still need to be filled */}
              {(() => {
                const filled = priorities.filter((p) => p.trim().length > 0).length;
                const remaining = 3 - filled;
                return (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`mt-3 text-xs font-sans text-center transition-colors duration-200 ${
                      remaining === 0 ? 'text-[#C9A84C]' : 'text-[#8A8578]'
                    }`}
                  >
                    {remaining === 0
                      ? 'All 3 priorities set — ready to continue.'
                      : `Add 3 priorities for today (${remaining} remaining)`}
                  </motion.p>
                );
              })()}
            </motion.div>
          )}

          {/* Step 2: Intention */}
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
                transition={{ delay: 0.1 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                Set your intention for today.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#8A8578] font-sans text-sm mb-8"
              >
                One sentence that anchors your day.
              </motion.p>

              <motion.textarea
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Today I will..."
                rows={4}
                maxLength={500}
                className="
                  w-full bg-[#141414] text-[#F5F0E8] font-sans
                  border border-[#2A2A2A] rounded-xl
                  px-4 py-3 text-sm resize-none
                  placeholder:text-[#8A8578]/50
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors duration-200
                "
              />
              <p className="text-right text-xs text-[#8A8578] mt-1.5 font-sans">
                {intention.length} / 500
              </p>
            </motion.div>
          )}

          {/* Step 3: AI Morning Message */}
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
                transition={{ delay: 0.1 }}
                className="font-display text-2xl text-[#F5F0E8] mb-2"
              >
                Here&apos;s your morning word.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#8A8578] font-sans text-sm mb-6"
              >
                A message crafted just for you today.
              </motion.p>

              {isLoadingAI ? (
                <div className="space-y-4">
                  {/* Loading skeleton */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-4 rounded bg-[#1A1A1A] shimmer-bg"
                      style={{ width: `${100 - i * 15}%` }}
                      animate={{ opacity: [0.4, 0.7, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                  <p className="text-[#8A8578] text-xs font-sans mt-4">
                    Preparing your morning message...
                  </p>
                </div>
              ) : morningMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 space-y-5"
                >
                  {/* Greeting */}
                  {morningMessage.greeting && (
                    <p className="text-[#F5F0E8] font-sans text-sm leading-relaxed">
                      {morningMessage.greeting}
                    </p>
                  )}

                  {/* Identity Reminder */}
                  {morningMessage.identity_reminder && (
                    <div className="border-l-2 border-[#C9A84C]/40 pl-4">
                      <p className="text-[#E8E0D0] font-display text-sm italic leading-relaxed">
                        {morningMessage.identity_reminder}
                      </p>
                    </div>
                  )}

                  {/* Streak Acknowledgment */}
                  {morningMessage.streak_acknowledgment && (
                    <p className="text-[#8A8578] font-sans text-sm">
                      {morningMessage.streak_acknowledgment}
                    </p>
                  )}

                  {/* Scripture */}
                  {morningMessage.scripture_or_wisdom && (
                    <div className="bg-[#141414] rounded-xl p-4 border border-[#2A2A2A]">
                      <p className="text-[#C9A84C] font-display text-sm leading-relaxed">
                        {morningMessage.scripture_or_wisdom}
                      </p>
                    </div>
                  )}

                  {/* Today's Focus */}
                  {morningMessage.todays_focus && (
                    <p className="text-[#F5F0E8] font-sans text-sm">
                      {morningMessage.todays_focus}
                    </p>
                  )}

                  {/* Commitments */}
                  {morningMessage.commitments &&
                    morningMessage.commitments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[#8A8578] text-xs font-sans uppercase tracking-wider">
                          Today&apos;s Commitments
                        </p>
                        {morningMessage.commitments.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-[#C9A84C] mt-0.5">
                              &bull;
                            </span>
                            <div>
                              <p className="text-[#F5F0E8] font-sans">
                                {c.commitment}
                              </p>
                              <p className="text-[#8A8578] text-xs font-sans">
                                {c.linked_target}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Closing Charge */}
                  {morningMessage.closing_charge && (
                    <div className="pt-2 border-t border-[#2A2A2A]">
                      <p className="text-[#E8E0D0] font-display text-sm font-semibold">
                        {morningMessage.closing_charge}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6">
                  <p className="text-[#8A8578] font-sans text-sm">
                    Your morning check-in has been saved. Go make today count.
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
        {step > 1 && step < 3 ? (
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
          ) : step === 3 ? (
            'Go to Dashboard'
          ) : step === 2 ? (
            'Submit & Get My Word'
          ) : (
            'Continue'
          )}
        </motion.button>
      </div>
    </div>
  );
}
