"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { DEFAULT_MORNING_TIME, DEFAULT_EVENING_TIME } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Timezone options (common US + international)
// ---------------------------------------------------------------------------

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central Europe (CET)" },
  { value: "Africa/Lagos", label: "West Africa (WAT)" },
  { value: "Africa/Nairobi", label: "East Africa (EAT)" },
  { value: "Asia/Dubai", label: "Gulf (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Japan (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const FAITH_TRADITIONS = [
  "Christianity",
  "Islam",
  "Judaism",
  "Buddhism",
  "Hinduism",
  "Spiritual but not religious",
  "Non-denominational",
  "Other",
  "Prefer not to say",
];

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { showToast } = useToast();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [occupation, setOccupation] = useState("");
  const [faithTradition, setFaithTradition] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [morningTime, setMorningTime] = useState(DEFAULT_MORNING_TIME);
  const [eveningTime, setEveningTime] = useState(DEFAULT_EVENING_TIME);
  const [timezone, setTimezone] = useState("America/New_York");

  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setOccupation(profile.occupation || "");
      setFaithTradition(profile.faith_tradition || "");
      setSmsOptIn(profile.sms_opt_in || false);
      setMorningTime(profile.sms_morning_time || DEFAULT_MORNING_TIME);
      setEveningTime(profile.sms_evening_time || DEFAULT_EVENING_TIME);
      setTimezone(profile.timezone || "America/New_York");
    }
  }, [profile, user]);

  // Save changes
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone || null,
        city: city || null,
        state: state || null,
        occupation: occupation || null,
        faith_tradition: faithTradition || null,
        sms_opt_in: smsOptIn,
        sms_morning_time: morningTime,
        sms_evening_time: eveningTime,
        timezone,
      });

      if (error) {
        showToast(error, "error");
      } else {
        showToast("Settings saved successfully", "success");
      }
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }, [
    fullName, phone, city, state, occupation, faithTradition,
    smsOptIn, morningTime, eveningTime, timezone,
    updateProfile, showToast,
  ]);

  // Sign out
  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      showToast("Failed to sign out", "error");
      setSigningOut(false);
    }
  }, [signOut, router, showToast]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-[#C9A84C]/30"
          style={{ borderTopColor: "#C9A84C" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-6 pb-28">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl text-[#F5F0E8]">Settings</h1>
        <p className="text-sm text-[#8A8578] font-sans mt-1">
          Manage your profile and preferences.
        </p>
      </motion.div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Profile Section */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
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
            label="Phone Number"
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

      {/* ──────────────────────────────────────────────────────── */}
      {/* SMS Preferences Section */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <SectionHeader title="SMS Preferences" />

        <div className="space-y-4">
          {/* Opt-in toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-[#F5F0E8] font-sans">
                SMS Check-ins
              </p>
              <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                Receive morning and evening prompts via text
              </p>
            </div>
            <button
              onClick={() => setSmsOptIn(!smsOptIn)}
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-300
                ${smsOptIn ? "bg-[#C9A84C]" : "bg-[#2A2A2A]"}
              `}
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                animate={{ left: smsOptIn ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {smsOptIn && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
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

              {/* Timezone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#F5F0E8] font-sans">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="
                    w-full bg-[#141414] text-[#F5F0E8] font-sans
                    border border-[#2A2A2A] rounded-xl
                    px-4 py-3 text-sm
                    focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
                    transition-colors duration-200
                    appearance-none
                  "
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238A8578' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    paddingRight: "40px",
                  }}
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Faith Tradition Section */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <SectionHeader title="Faith (Optional)" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#F5F0E8] font-sans">
            Faith Tradition
          </label>
          <select
            value={faithTradition}
            onChange={(e) => setFaithTradition(e.target.value)}
            className="
              w-full bg-[#141414] text-[#F5F0E8] font-sans
              border border-[#2A2A2A] rounded-xl
              px-4 py-3 text-sm
              focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
              transition-colors duration-200
              appearance-none
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238A8578' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              paddingRight: "40px",
            }}
          >
            <option value="">Select your tradition...</option>
            {FAITH_TRADITIONS.map((faith) => (
              <option key={faith} value={faith}>
                {faith}
              </option>
            ))}
          </select>
        </div>
      </motion.section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Action Buttons */}
      {/* ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 mt-10"
      >
        {/* Save */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={handleSave}
          disabled={saving}
          className="
            w-full flex items-center justify-center gap-2
            bg-[#C9A84C] text-[#0A0A0A] font-sans font-semibold
            px-6 py-3.5 rounded-xl text-sm
            shadow-gold hover:bg-[#C9A84C]/90
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </motion.button>

        {/* Divider */}
        <div className="h-px bg-[#2A2A2A] my-2" />

        {/* Sign Out */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={handleSignOut}
          disabled={signingOut}
          className="
            w-full flex items-center justify-center gap-2
            bg-[#8B2500] text-[#F5F0E8] font-sans font-semibold
            px-6 py-3.5 rounded-xl text-sm
            hover:bg-[#8B2500]/90
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {signingOut ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing out...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Version info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-[10px] text-[#8A8578]/50 font-sans mt-8"
      >
        Lockd In v0.1.0
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
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
  type = "text",
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
          ${type === "time" ? "appearance-none" : ""}
        `}
      />
    </div>
  );
}
