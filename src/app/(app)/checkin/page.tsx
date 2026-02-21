'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * /checkin index page — shows a card to pick morning or evening check-in.
 * The BottomNav links here, so this page must exist.
 */
export default function CheckinIndexPage() {
  const router = useRouter();

  // Smart redirect: send users to the most relevant check-in based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    // After 3 PM, lean toward evening; before 3 PM lean toward morning
    if (hour >= 15) {
      router.replace('/checkin/evening');
    } else {
      router.replace('/checkin/morning');
    }
  }, [router]);

  // Show a brief loading UI while the redirect happens
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h1 className="font-display text-2xl text-[#F5F0E8] mb-2">Check-in</h1>
        <p className="text-[#8A8578] font-sans text-sm">Choose your check-in for today.</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4">
        <Link href="/checkin/morning">
          <motion.div
            whileHover={{ borderColor: 'rgba(201, 168, 76, 0.5)', boxShadow: '0 0 20px rgba(201, 168, 76, 0.08)' }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="#C9A84C" strokeWidth="1.5" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[#F5F0E8] font-sans text-sm font-semibold">Morning Check-in</p>
              <p className="text-[#8A8578] font-sans text-xs mt-0.5">Set your priorities and intention</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/checkin/evening">
          <motion.div
            whileHover={{ borderColor: 'rgba(201, 168, 76, 0.5)', boxShadow: '0 0 20px rgba(201, 168, 76, 0.08)' }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[#F5F0E8] font-sans text-sm font-semibold">Evening Reflection</p>
              <p className="text-[#8A8578] font-sans text-xs mt-0.5">Review your day and log wins</p>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
