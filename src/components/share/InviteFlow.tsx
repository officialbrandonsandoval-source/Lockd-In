"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { APP_NAME } from "@/lib/utils/constants";
import ShareButton from "./ShareButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InviteFlowProps {
  userName: string;
  referralCode: string;
  referralStats?: {
    totalInvites: number;
    signedUp: number;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InviteFlow({
  referralCode,
  referralStats,
}: InviteFlowProps) {
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://lockdin.app";

  const referralUrl = `${baseUrl}/invite/${referralCode}`;

  const defaultMessage = `I have been using ${APP_NAME} to build a personal blueprint for my life — identity, purpose, faith, family, fitness, finances, and focus. Every morning I set intentions. Every evening I reflect. Every week I get a pulse on how aligned I am. It is changing how I show up as a man.\n\nJoin me: ${referralUrl}`;

  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    setMessage(
      `I have been using ${APP_NAME} to build a personal blueprint for my life — identity, purpose, faith, family, fitness, finances, and focus. Every morning I set intentions. Every evening I reflect. Every week I get a pulse on how aligned I am. It is changing how I show up as a man.\n\nJoin me: ${referralUrl}`
    );
  }, [referralUrl]);

  const shareViaSMS = useCallback(() => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`sms:?&body=${encodedMessage}`, "_blank");
  }, [message]);

  const shareViaWhatsApp = useCallback(() => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  }, [message]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = referralUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [referralUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display text-xl text-[#F5F0E8]">
          Invite a Brother
        </h2>
        <p className="text-sm text-[#8A8578] font-sans mt-1">
          Share {APP_NAME} with someone who is ready to level up.
        </p>
      </div>

      {/* Personal message */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#F5F0E8] font-sans">
          Your Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="
            w-full bg-[#141414] text-[#F5F0E8] font-sans
            border border-[#2A2A2A] rounded-xl
            px-4 py-3 text-sm
            placeholder:text-[#8A8578]/50
            focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30
            transition-colors duration-200 resize-none
          "
        />
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[#8A8578] font-sans uppercase tracking-wider">
          Share via
        </p>

        <div className="grid grid-cols-3 gap-3">
          {/* SMS */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={shareViaSMS}
            className="
              flex flex-col items-center gap-2 py-3 rounded-xl
              bg-[#1A1A1A] border border-[#2A2A2A]
              hover:border-[#C9A84C]/30 transition-colors
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span className="text-xs font-sans text-[#E8E0D0]">SMS</span>
          </motion.button>

          {/* WhatsApp */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={shareViaWhatsApp}
            className="
              flex flex-col items-center gap-2 py-3 rounded-xl
              bg-[#1A1A1A] border border-[#2A2A2A]
              hover:border-[#C9A84C]/30 transition-colors
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            <span className="text-xs font-sans text-[#E8E0D0]">WhatsApp</span>
          </motion.button>

          {/* Copy Link */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={copyLink}
            className="
              flex flex-col items-center gap-2 py-3 rounded-xl
              bg-[#1A1A1A] border border-[#2A2A2A]
              hover:border-[#C9A84C]/30 transition-colors
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-xs font-sans text-[#E8E0D0]">Copy Link</span>
          </motion.button>
        </div>
      </div>

      {/* Native share fallback */}
      <ShareButton
        shareData={{
          title: `Join me on ${APP_NAME}`,
          text: message,
          url: referralUrl,
        }}
      />

      {/* Referral stats */}
      {referralStats && (referralStats.totalInvites > 0 || referralStats.signedUp > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="
            mt-2 p-4 rounded-xl
            bg-[#1A1A1A] border border-[#2A2A2A]
          "
        >
          <p className="text-xs text-[#8A8578] font-sans uppercase tracking-wider mb-3">
            Your Impact
          </p>
          <div className="flex items-center gap-6">
            <div>
              <p className="font-display text-2xl text-[#C9A84C]">
                {referralStats.totalInvites}
              </p>
              <p className="text-xs text-[#8A8578] font-sans">
                Invites Shared
              </p>
            </div>
            <div className="h-8 w-px bg-[#2A2A2A]" />
            <div>
              <p className="font-display text-2xl text-[#C9A84C]">
                {referralStats.signedUp}
              </p>
              <p className="text-xs text-[#8A8578] font-sans">
                Joined
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Referral code display */}
      <div className="text-center">
        <p className="text-[10px] text-[#8A8578] font-sans uppercase tracking-wider mb-1">
          Your Referral Code
        </p>
        <p className="font-mono text-sm text-[#C9A84C] tracking-widest">
          {referralCode}
        </p>
      </div>
    </motion.div>
  );
}
