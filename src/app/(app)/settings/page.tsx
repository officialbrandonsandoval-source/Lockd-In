'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import type { Profile, Database } from '@/lib/supabase/types';
import {
  DEFAULT_MORNING_TIME,
  DEFAULT_EVENING_TIME,
} from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Timezone options (major US + common international)
// ---------------------------------------------------------------------------

const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST, no DST)' },
];

const INTERNATIONAL_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

const ALL_TIMEZONES = [
  { group: 'United States', options: US_TIMEZONES },
  { group: 'International', options: INTERNATIONAL_TIMEZONES },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ---------------------------------------------------------------------------
// Inline Toast
// ---------------------------------------------------------------------------

function InlineToast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
    >
      <div
        className={`
          flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg font-sans text-sm font-semibold
          ${
            type === 'success'
              ? 'bg-[#2D5A27] text-[#F5F0E8]'
              : 'bg-[#8B2500] text-[#F5F0E8]'
          }
        `}
      >
        {type === 'success' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {message}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-sm font-semibold text-[#C9A84C] font-sans uppercase tracking-wider">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[#2A2A2A]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
}: SettingsInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#F5F0E8] font-sans">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full bg-[#141414] text-[#F5F0E8] font-sans
          border border-[#2A2A2A] rounded-xl
          px-4 py-3 text-sm
          placeholder:text-[#8A8578]/50
          focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${type === 'time' ? 'appearance-none' : ''}
        `}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter();

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [occupation, setOccupation] = useState('');
  const [faithTradition, setFaithTradition] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [morningTime, setMorningTime] = useState<string>(DEFAULT_MORNING_TIME);
  const [eveningTime, setEveningTime] = useState<string>(DEFAULT_EVENING_TIME);
  const [timezone, setTimezone] = useState('America/New_York');

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const p = profile as Profile;
          setFullName(p.full_name || '');
          setEmail(p.email || user.email || '');
          setPhone(p.phone || '');
          setCity(p.city || '');
          setState(p.state || '');
          setOccupation(p.occupation || '');
          setFaithTradition(p.faith_tradition || '');
          setSmsOptIn(p.sms_opt_in || false);
          setMorningTime(p.sms_morning_time || DEFAULT_MORNING_TIME);
          setEveningTime(p.sms_evening_time || DEFAULT_EVENING_TIME);
          setTimezone(p.timezone || 'America/New_York');
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [supabase, router]);

  // Save handler
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setToast({ message: 'Not authenticated.', type: 'error' });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          occupation: occupation.trim() || null,
          faith_tradition: faithTradition.trim() || null,
          sms_opt_in: smsOptIn,
          sms_morning_time: morningTime,
          sms_evening_time: eveningTime,
          timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setToast({ message: 'Failed to save changes.', type: 'error' });
      } else {
        setToast({ message: 'Settings saved successfully.', type: 'success' });
      }
    } catch {
      setToast({ message: 'Something went wrong.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [
    supabase,
    fullName,
    phone,
    city,
    state,
    occupation,
    faithTradition,
    smsOptIn,
    morningTime,
    eveningTime,
    timezone,
  ]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setToast({ message: 'Failed to sign out.', type: 'error' });
      setSigningOut(false);
    }
  }, [supabase, router]);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-4 py-8 max-w-lg mx-auto">
        <div className="space-y-6">
          <div className="h-8 w-32 bg-[#1A1A1A] rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-[#1A1A1A] rounded animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ---- Select dropdown styling ----
  const selectClass = `
    w-full bg-[#141414] text-[#F5F0E8] font-sans
    border border-[#2A2A2A] rounded-xl
    px-4 py-3 text-sm
    focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
    transition-colors duration-200 appearance-none cursor-pointer
  `;

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238A8578' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 16px center',
    paddingRight: '40px',
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-6 pb-28 max-w-lg mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* ── Page header ────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <h1 className="font-display text-2xl text-[#E8E0D0]">Settings</h1>
          <p className="text-sm text-[#8A8578] font-sans mt-1">
            Manage your profile and preferences.
          </p>
        </motion.div>

        {/* ── Profile Section ────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Profile" />
          <div className="space-y-4">
            <SettingsInput
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
            />
            <SettingsInput
              label="Email"
              value={email}
              onChange={() => {}}
              placeholder="your@email.com"
              disabled
              type="email"
            />
            <SettingsInput
              label="Phone"
              value={phone}
              onChange={setPhone}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
            <div className="grid grid-cols-2 gap-3">
              <SettingsInput
                label="City"
                value={city}
                onChange={setCity}
                placeholder="City"
              />
              <SettingsInput
                label="State"
                value={state}
                onChange={setState}
                placeholder="State"
              />
            </div>
            <SettingsInput
              label="Occupation"
              value={occupation}
              onChange={setOccupation}
              placeholder="What do you do?"
            />
          </div>
        </motion.section>

        {/* ── SMS Preferences Section ────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="SMS Preferences" />
          <div className="space-y-4">
            {/* Opt-in toggle */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[#F5F0E8] font-sans">
                  SMS Check-in Reminders
                </p>
                <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                  Receive morning and evening prompts via text
                </p>
              </div>
              <button
                onClick={() => setSmsOptIn(!smsOptIn)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30
                  ${smsOptIn ? 'bg-[#C9A84C]' : 'bg-[#2A2A2A]'}
                `}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ left: smsOptIn ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Time pickers (only show when opted-in) */}
            <AnimatePresence>
              {smsOptIn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <SettingsInput
                      label="Morning Time"
                      value={morningTime}
                      onChange={setMorningTime}
                      type="time"
                    />
                    <SettingsInput
                      label="Evening Time"
                      value={eveningTime}
                      onChange={setEveningTime}
                      type="time"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Timezone Section ───────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Timezone" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#F5F0E8] font-sans">
              Your Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={selectClass}
              style={selectStyle}
            >
              {ALL_TIMEZONES.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </motion.section>

        {/* ── Faith Tradition Section ────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <SectionHeader title="Faith" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#F5F0E8] font-sans">
              Faith Tradition
            </label>
            <input
              type="text"
              value={faithTradition}
              onChange={(e) => setFaithTradition(e.target.value)}
              placeholder="e.g. Christian, Non-denominational, Muslim"
              className="
                w-full bg-[#141414] text-[#F5F0E8] font-sans
                border border-[#2A2A2A] rounded-xl
                px-4 py-3 text-sm
                placeholder:text-[#8A8578]/50
                focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                transition-colors duration-200
              "
            />
            <p className="text-[10px] text-[#8A8578] font-sans mt-0.5">
              Helps personalize your scripture and encouragement
            </p>
          </div>
        </motion.section>

        {/* ── Save Changes Button ────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={handleSave}
            disabled={saving}
            className="
              w-full flex items-center justify-center gap-2
              bg-[#C9A84C] text-[#0A0A0A] font-sans font-semibold
              px-6 py-3.5 rounded-xl text-sm
              hover:bg-[#C9A84C]/90
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {saving ? (
              <>
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
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </motion.div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="h-px bg-[#2A2A2A]" />
        </motion.div>

        {/* ── Sign Out Button (outlined danger/red) ──────────────── */}
        <motion.div variants={itemVariants}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={handleSignOut}
            disabled={signingOut}
            className="
              w-full flex items-center justify-center gap-2
              bg-transparent text-[#8B2500] font-sans font-semibold
              border border-[#8B2500]/40
              px-6 py-3 rounded-xl text-sm
              hover:bg-[#8B2500]/10 hover:border-[#8B2500]/60
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {signingOut ? (
              <>
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
                Signing out...
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── Version ──────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-[10px] text-[#8A8578]/50 font-sans mt-8"
      >
        Lockd In v0.1.0
      </motion.p>

      {/* ── Toast Notification ───────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <InlineToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
