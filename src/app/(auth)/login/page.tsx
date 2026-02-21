'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path
          d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
      // On success, Supabase redirects to Google — no further action needed here.
    } catch {
      setError('Something went wrong. Please try again.');
      setGoogleLoading(false);
    }
  };

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
                Sign in to continue your path.
              </p>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              loading={googleLoading}
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="!bg-white !text-gray-800 hover:!bg-gray-100 !border !border-gray-200 !font-medium"
            >
              {!googleLoading && <GoogleIcon />}
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#2A2A2A]" />
              <span className="text-xs text-[#8A8578] whitespace-nowrap">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>

            {/* Magic Link Form */}
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
