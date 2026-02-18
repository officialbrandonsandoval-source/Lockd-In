'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Priority {
  text: string;
  completed: boolean;
}

interface TodayCardProps {
  priorities: Priority[];
  onToggle: (index: number) => void;
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function TodayCard({ priorities, onToggle }: TodayCardProps) {
  if (!priorities || priorities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6"
      >
        <h3 className="font-display text-lg text-[#F5F0E8] mb-2">
          Today&apos;s Priorities
        </h3>
        <p className="text-[#8A8578] text-sm mb-4 font-sans">
          You haven&apos;t set your priorities for today yet.
        </p>
        <Link
          href="/app/checkin/morning"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Set your morning priorities
        </Link>
      </motion.div>
    );
  }

  const completedCount = priorities.filter((p) => p.completed).length;
  const totalCount = priorities.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-[#F5F0E8]">
          Today&apos;s Priorities
        </h3>
        <span className="text-xs text-[#8A8578] font-sans tabular-nums">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#2A2A2A] rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-[#C9A84C] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Priority list */}
      <ul className="space-y-3">
        {priorities.map((priority, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <button
              onClick={() => onToggle(index)}
              className="flex items-start gap-3 w-full text-left group"
            >
              <div
                className={`
                  mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center
                  transition-all duration-200 flex-shrink-0
                  ${
                    priority.completed
                      ? 'bg-[#C9A84C] border-[#C9A84C]'
                      : 'border-[#2A2A2A] group-hover:border-[#C9A84C]/50'
                  }
                `}
              >
                {priority.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <CheckIcon className="w-3 h-3 text-[#0A0A0A]" />
                  </motion.div>
                )}
              </div>
              <span
                className={`
                  text-sm font-sans leading-relaxed transition-all duration-200
                  ${
                    priority.completed
                      ? 'text-[#8A8578] line-through'
                      : 'text-[#F5F0E8]'
                  }
                `}
              >
                {priority.text}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
