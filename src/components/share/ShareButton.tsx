"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface ShareButtonProps {
  shareData: ShareData;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShareButton({ shareData, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = shareData.url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareData.url]);

  const handleShare = useCallback(async () => {
    if (canNativeShare) {
      setSharing(true);
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      } catch (err) {
        // User cancelled or share failed — fall back to copy
        if ((err as Error)?.name !== "AbortError") {
          await copyToClipboard();
        }
      } finally {
        setSharing(false);
      }
    } else {
      await copyToClipboard();
    }
  }, [canNativeShare, shareData, copyToClipboard]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Primary share / copy button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleShare}
        disabled={sharing}
        className="
          inline-flex items-center justify-center gap-2.5
          bg-[#C9A84C] text-[#0A0A0A] font-sans font-semibold
          px-6 py-3 rounded-xl text-sm
          shadow-gold hover:bg-[#C9A84C]/90
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {/* Icon */}
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
          {canNativeShare ? (
            <>
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </>
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </>
          )}
        </svg>

        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              Link Copied!
            </motion.span>
          ) : (
            <motion.span
              key="share"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {canNativeShare ? "Share" : "Copy Link"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Secondary copy link button (only when native share is available) */}
      {canNativeShare && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={copyToClipboard}
          className="
            inline-flex items-center justify-center gap-2
            bg-transparent border border-[#C9A84C] text-[#C9A84C]
            font-sans text-sm px-6 py-2.5 rounded-xl
            hover:bg-[#C9A84C]/10
            transition-colors duration-200
          "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copied2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Copy Link
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  );
}
