'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PriorityInput from './PriorityInput';

interface MorningFlowProps {
  userName: string;
}

interface MorningAIMessage {
  greeting?: string;
  identity_reminder?: string;
  streak_acknowledgment?: string;
  scripture_or_wisdom?: string;
  todays_focus?: string;
  commitments?: Array<{ commitment: string; linked_target: string }>;
  closing_charge?: string;
}

const TOTAL_STEPS = 3;

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

export default function MorningFlow({ userName }: MorningFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [priorities, setPriorities] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<MorningAIMessage | null>(null);
  const [aiRawText, setAiRawText] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const updatePriority = useCallback((index: number, value: string) => {
    setPriorities((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const canProceed = (): boolean => {
    if (step === 1) {
      return priorities.every((p) => p.trim().length > 0);
    }
    if (step === 2) {
      return intention.trim().length > 0;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');

    if (step === 2) {
      // Submit the check-in and fetch AI message
      setIsSubmitting(true);
      try {
        const checkinRes = await fetch('/api/checkin/morning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priorities, intention }),
        });

        if (!checkinRes.ok) {
          const data = await checkinRes.json();
          setError(data.error || 'Failed to save check-in.');
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setDirection(1);
        setStep(3);

        // Now fetch AI morning message
        setIsLoadingAI(true);
        try {
          const aiRes = await fetch('/api/agent/morning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (typeof aiData.message === 'object') {
              setAiMessage(aiData.message);
            } else {
              setAiRawText(
                typeof aiData.message === 'string'
                  ? aiData.message
                  : JSON.stringify(aiData.message)
              );
            }
          }
        } catch {
          // AI message is optional; do not block the flow
          setAiRawText(
            'Your morning word is being prepared. Check back on your dashboard.'
          );
        } finally {
          setIsLoadingAI(false);
        }
      } catch {
        setError('Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
      return;
    }

    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleFinish = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  // Success animation overlay
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-[#2D5A27]/20 flex items-center justify-center mb-6"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#F5F0E8] font-display text-xl"
        >
          You are locked in.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[#8A8578] font-sans text-sm mt-2"
        >
          Go build something today, {userName}.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-3 pt-8 pb-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
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
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-md"
            >
              <h2 className="font-display text-2xl text-[#F5F0E8] mb-2">
                Good morning, {userName}.
              </h2>
              <p className="text-[#8A8578] font-sans text-sm mb-8">
                What are your top 3 priorities today?
              </p>

              <div className="flex flex-col gap-4">
                {priorities.map((value, idx) => (
                  <PriorityInput
                    key={idx}
                    index={idx}
                    value={value}
                    onChange={(val) => updatePriority(idx, val)}
                    placeholder={
                      idx === 0
                        ? 'Most important thing today...'
                        : idx === 1
                          ? 'Second priority...'
                          : 'Third priority...'
                    }
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-md"
            >
              <h2 className="font-display text-2xl text-[#F5F0E8] mb-2">
                Set your intention for today.
              </h2>
              <p className="text-[#8A8578] font-sans text-sm mb-8">
                Who do you want to be today? What mindset are you carrying?
              </p>

              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Today I will..."
                rows={5}
                className="
                  w-full bg-[#141414] text-[#F5F0E8] font-sans
                  border border-[#2A2A2A] rounded-xl
                  px-4 py-3 text-sm
                  placeholder:text-[#8A8578]/50
                  focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                  transition-colors duration-200 resize-none
                "
                maxLength={500}
              />
              <p className="text-right text-xs text-[#8A8578] mt-1 font-sans">
                {intention.length} / 500
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full max-w-md"
            >
              <h2 className="font-display text-2xl text-[#F5F0E8] mb-2">
                Here&apos;s your morning word.
              </h2>
              <p className="text-[#8A8578] font-sans text-sm mb-8">
                A word crafted for you, for today.
              </p>

              {isLoadingAI ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <motion.div
                    className="w-10 h-10 rounded-full border-2 border-[#2A2A2A]"
                    style={{ borderTopColor: '#C9A84C' }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <p className="text-[#8A8578] font-sans text-sm">
                    Preparing your morning word...
                  </p>
                </div>
              ) : aiMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {aiMessage.greeting && (
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
                      <p className="text-[#F5F0E8] font-sans text-sm leading-relaxed">
                        {aiMessage.greeting}
                      </p>
                    </div>
                  )}

                  {aiMessage.identity_reminder && (
                    <div className="bg-[#1A1A1A] border border-[#C9A84C]/20 rounded-2xl p-5">
                      <p className="text-xs text-[#C9A84C] font-sans font-semibold uppercase tracking-wider mb-2">
                        Identity
                      </p>
                      <p className="text-[#E8E0D0] font-display text-base italic leading-relaxed">
                        {aiMessage.identity_reminder}
                      </p>
                    </div>
                  )}

                  {aiMessage.scripture_or_wisdom && (
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
                      <p className="text-xs text-[#C9A84C] font-sans font-semibold uppercase tracking-wider mb-2">
                        Scripture
                      </p>
                      <p className="text-[#F5F0E8] font-sans text-sm leading-relaxed">
                        {aiMessage.scripture_or_wisdom}
                      </p>
                    </div>
                  )}

                  {aiMessage.streak_acknowledgment && (
                    <p className="text-[#8A8578] font-sans text-sm leading-relaxed">
                      {aiMessage.streak_acknowledgment}
                    </p>
                  )}

                  {aiMessage.closing_charge && (
                    <div className="pt-2 border-t border-[#2A2A2A]">
                      <p className="text-[#C9A84C] font-display text-base leading-relaxed">
                        {aiMessage.closing_charge}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : aiRawText ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5"
                >
                  <p className="text-[#F5F0E8] font-sans text-sm leading-relaxed whitespace-pre-wrap">
                    {aiRawText}
                  </p>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-2"
        >
          <p className="text-center text-sm text-red-400 font-sans">{error}</p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="px-5 pb-8 pt-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          {step > 1 && step < 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBack}
              className="
                flex-1 py-3.5 rounded-xl font-sans text-sm font-medium
                bg-transparent border border-[#2A2A2A] text-[#8A8578]
                hover:border-[#C9A84C]/30 hover:text-[#F5F0E8]
                transition-colors duration-200
              "
            >
              Back
            </motion.button>
          )}

          {step < 3 ? (
            <motion.button
              whileHover={canProceed() ? { scale: 1.02 } : undefined}
              whileTap={canProceed() ? { scale: 0.97 } : undefined}
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={`
                flex-1 py-3.5 rounded-xl font-sans text-sm font-semibold
                transition-colors duration-200
                ${
                  canProceed() && !isSubmitting
                    ? 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#C9A84C]/90 shadow-gold cursor-pointer'
                    : 'bg-[#2A2A2A] text-[#8A8578] cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    className="inline-block w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Saving...
                </span>
              ) : step === 2 ? (
                'Submit & Get Your Word'
              ) : (
                'Continue'
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleFinish}
              disabled={isLoadingAI}
              className={`
                flex-1 py-3.5 rounded-xl font-sans text-sm font-semibold
                transition-colors duration-200
                ${
                  isLoadingAI
                    ? 'bg-[#2A2A2A] text-[#8A8578] cursor-not-allowed'
                    : 'bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#C9A84C]/90 shadow-gold cursor-pointer'
                }
              `}
            >
              Let&apos;s Go
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
