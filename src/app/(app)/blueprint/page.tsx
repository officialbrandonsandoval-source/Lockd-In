'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Blueprint, Database } from '@/lib/supabase/types';
import BlueprintDocument from '@/components/blueprint/BlueprintDocument';

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchBlueprint() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('blueprints')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('version', { ascending: false })
          .limit(1)
          .single();

        if (data) setBlueprint(data);
      } catch (err) {
        console.error('Blueprint fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlueprint();
  }, [supabase]);

  const handleShare = async () => {
    if (!blueprint) return;
    setShareLoading(true);

    try {
      // Attempt to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Lockd In Blueprint',
          text: blueprint.identity_statement
            ? `My Identity: ${blueprint.identity_statement}`
            : 'Check out my Lockd In Blueprint',
          url: window.location.href,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } catch {
      // User cancelled share or error
    } finally {
      setShareLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 max-w-lg mx-auto">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-8 w-48 bg-[#1A1A1A] rounded-lg animate-pulse" />
          </div>
          {/* Identity skeleton */}
          <div className="h-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
          {/* Section skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no blueprint
  if (!blueprint) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#C9A84C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-[#E8E0D0] mb-2">
            No Blueprint Yet
          </h2>
          <p className="text-[#8A8578] text-sm font-sans leading-relaxed mb-6">
            Your Blueprint is your personal declaration of who you are and where
            you&apos;re heading. Complete the assessment to generate yours.
          </p>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 pb-28 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page header */}
        <div className="mb-8">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#8A8578] hover:text-[#C9A84C] transition-colors font-sans mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Dashboard
          </Link>
          <h1 className="font-display text-3xl text-[#E8E0D0]">
            Your Blueprint
          </h1>
          <p className="text-sm text-[#8A8578] font-sans mt-1">
            Version {blueprint.version} &middot; Last updated{' '}
            {new Date(blueprint.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Blueprint Document */}
        <BlueprintDocument blueprint={blueprint} />
      </motion.div>

      {/* Floating Share Button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="max-w-lg w-full px-4 flex justify-end pointer-events-auto">
          <AnimatePresence mode="wait">
            {shareSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="flex items-center gap-2 px-5 py-3 bg-[#2D5A27] text-[#F5F0E8] text-sm font-sans font-semibold rounded-full shadow-lg"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Link copied
              </motion.div>
            ) : (
              <motion.button
                key="share"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 1, duration: 0.4 }}
                onClick={handleShare}
                disabled={shareLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm rounded-full shadow-gold-lg hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {shareLoading ? 'Sharing...' : 'Share Blueprint'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
