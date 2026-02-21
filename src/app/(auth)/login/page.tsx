'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
      className="flex flex-col items-center"
    >
      {/* Logo / Wordmark */}
      <Link href="/" className="mb-10">
        <span className="text-[#C9A84C] font-serif text-3xl font-bold tracking-[0.2em]">
          LOCKD IN
        </span>
      </Link>

      {/* Card */}
      <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        {sent ? (
          /* ── Success State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col items-center text-center gap-4 py-4"
          >
            {/* Gold check icon */}
            <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-[#C9A84C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#F5F0E8] mb-2">
                Check your email.
              </h2>
              <p className="text-[#8A8578] text-sm leading-relaxed">
                We sent a magic link to{' '}
                <span className="text-[#C9A84C] font-medium">{email}</span>.
                <br />
                Click the link to begin your journey.
              </p>
            </div>

            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-xs text-[#8A8578] hover:text-[#C9A84C] transition-colors mt-2 underline underline-offset-2"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          /* ── Login Form ── */
          <>
            <div className="mb-7 text-center">
              <h1 className="font-serif text-2xl font-bold text-[#F5F0E8] mb-2">
                Begin your journey.
              </h1>
              <p className="text-[#8A8578] text-sm leading-relaxed">
                Enter your email and we&apos;ll send you a secure magic link —
                no password needed.
              </p>
            </div>

            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 font-sans"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!email.trim()}
              >
                Send Magic Link
              </Button>
            </form>

            <p className="text-center text-xs text-[#8A8578] mt-6 leading-relaxed">
              By continuing, you agree to build with purpose.
              <br />
              <span className="text-[#C9A84C]/60">All glory to God.</span>
            </p>
          </>
        )}
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-6 text-xs text-[#8A8578] hover:text-[#C9A84C] transition-colors"
      >
        ← Back to home
      </Link>
    </motion.div>
  );
}
