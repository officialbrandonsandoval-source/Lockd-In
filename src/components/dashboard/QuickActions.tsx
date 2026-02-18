'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface QuickActionsProps {
  hasMorningCheckin: boolean;
  hasEveningCheckin: boolean;
}

function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CheckCircleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function QuickActions({
  hasMorningCheckin,
  hasEveningCheckin,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Morning Check-in */}
      {hasMorningCheckin ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center gap-4 opacity-60"
        >
          <div className="w-12 h-12 rounded-xl bg-[#2D5A27]/20 flex items-center justify-center flex-shrink-0">
            <CheckCircleIcon className="w-6 h-6 text-[#2D5A27]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8A8578] font-sans">
              Morning locked in
            </p>
            <p className="text-xs text-[#8A8578]/70 font-sans mt-0.5">
              Completed
            </p>
          </div>
        </motion.div>
      ) : (
        <Link href="/checkin/morning">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{
              borderColor: 'rgba(201, 168, 76, 0.4)',
              boxShadow: '0 0 20px rgba(201, 168, 76, 0.1)',
            }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#1A1A1A] border border-[#C9A84C]/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A84C]/20 transition-colors">
              <SunIcon className="w-6 h-6 text-[#C9A84C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F5F0E8] font-sans">
                Lock in your morning
              </p>
              <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                Set intentions &amp; priorities
              </p>
            </div>
            <svg
              className="w-5 h-5 text-[#C9A84C] ml-auto flex-shrink-0"
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
      )}

      {/* Evening Check-in */}
      {hasEveningCheckin ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center gap-4 opacity-60"
        >
          <div className="w-12 h-12 rounded-xl bg-[#2D5A27]/20 flex items-center justify-center flex-shrink-0">
            <CheckCircleIcon className="w-6 h-6 text-[#2D5A27]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8A8578] font-sans">
              Evening reflection done
            </p>
            <p className="text-xs text-[#8A8578]/70 font-sans mt-0.5">
              Completed
            </p>
          </div>
        </motion.div>
      ) : (
        <Link href="/checkin/evening">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{
              borderColor: hasMorningCheckin
                ? 'rgba(201, 168, 76, 0.4)'
                : 'rgba(42, 42, 42, 0.7)',
              boxShadow: hasMorningCheckin
                ? '0 0 20px rgba(201, 168, 76, 0.1)'
                : 'none',
            }}
            whileTap={hasMorningCheckin ? { scale: 0.98 } : undefined}
            className={`
              bg-[#1A1A1A] rounded-2xl p-5 flex items-center gap-4
              ${
                hasMorningCheckin
                  ? 'border border-[#C9A84C]/30 cursor-pointer group'
                  : 'border border-[#2A2A2A] opacity-40 pointer-events-none'
              }
            `}
          >
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${
                  hasMorningCheckin
                    ? 'bg-[#C9A84C]/10 group-hover:bg-[#C9A84C]/20'
                    : 'bg-[#2A2A2A]/50'
                }
              `}
            >
              <MoonIcon
                className={`w-6 h-6 ${hasMorningCheckin ? 'text-[#C9A84C]' : 'text-[#8A8578]'}`}
              />
            </div>
            <div>
              <p
                className={`text-sm font-semibold font-sans ${hasMorningCheckin ? 'text-[#F5F0E8]' : 'text-[#8A8578]'}`}
              >
                Reflect on your day
              </p>
              <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                {hasMorningCheckin
                  ? 'Wins, growth & gratitude'
                  : 'Complete morning first'}
              </p>
            </div>
            {hasMorningCheckin && (
              <svg
                className="w-5 h-5 text-[#C9A84C] ml-auto flex-shrink-0"
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
            )}
          </motion.div>
        </Link>
      )}
    </div>
  );
}
