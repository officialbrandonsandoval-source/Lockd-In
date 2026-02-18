"use client";

import React from "react";
import { motion } from "framer-motion";

interface GoldShimmerProps {
  message?: string;
  submessage?: string;
}

export default function GoldShimmer({
  message = "Building your blueprint...",
  submessage,
}: GoldShimmerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-bg">
      {/* Radial gold glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0) 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner gold ring */}
      <motion.div
        className="relative w-16 h-16 rounded-full border-2 border-brand-gold/30"
        animate={{
          borderColor: [
            "rgba(201,168,76,0.3)",
            "rgba(201,168,76,0.8)",
            "rgba(201,168,76,0.3)",
          ],
          boxShadow: [
            "0 0 0 0 rgba(201,168,76,0)",
            "0 0 24px 8px rgba(201,168,76,0.2)",
            "0 0 0 0 rgba(201,168,76,0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid transparent",
            borderTopColor: "#C9A84C",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-gold"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Message */}
      <motion.p
        className="mt-8 text-brand-text font-display text-lg tracking-wide"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {message}
      </motion.p>

      {/* Submessage */}
      {submessage && (
        <motion.p
          className="mt-2 text-brand-text-secondary font-sans text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {submessage}
        </motion.p>
      )}

      {/* Bottom shimmer bar */}
      <motion.div
        className="mt-10 w-48 h-0.5 rounded-full overflow-hidden bg-brand-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full w-1/3 rounded-full bg-brand-gold"
          animate={{ x: ["-100%", "400%"] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
}
