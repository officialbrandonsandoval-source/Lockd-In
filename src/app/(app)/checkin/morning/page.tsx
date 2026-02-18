'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MorningFlow from '@/components/checkin/MorningFlow';

export default function MorningCheckinPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const firstName = profile?.full_name?.split(' ')[0] || 'King';
      setUserName(firstName);

      // Check if morning check-in already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCheckin } = await supabase
        .from('daily_checkins')
        .select('morning_completed_at')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .single();

      if (existingCheckin?.morning_completed_at) {
        setAlreadyCompleted(true);
      }

      setLoading(false);
    }

    init();
  }, [router]);

  // Loading state
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

  // Already completed
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-[#2D5A27]/20 flex items-center justify-center mx-auto mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="#2D5A27"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-[#F5F0E8] mb-2">
            Morning check-in complete.
          </h2>
          <p className="text-[#8A8578] font-sans text-sm mb-8">
            You already locked in this morning. Come back tonight for your evening reflection.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard')}
            className="px-7 py-3 rounded-xl font-sans text-sm font-semibold bg-[#C9A84C] text-[#0A0A0A] hover:bg-[#C9A84C]/90 shadow-gold"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return <MorningFlow userName={userName || 'King'} />;
}
