"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle radial glow behind content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#C9A84C]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* Logo */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-[#C9A84C] text-lg tracking-[0.3em] uppercase mb-16"
        >
          LOCKD IN
        </motion.h2>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="font-display text-[#F5F0E8] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-8"
        >
          It&apos;s time to lock in.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
          className="font-sans text-[#8A8578] text-base sm:text-lg leading-relaxed max-w-md mb-14"
        >
          The next 30 minutes will change everything. Answer honestly. No one
          sees this but you and God. Your Blueprint — your purpose, your
          legacy, your daily operating system — starts here.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }}
          className="w-full max-w-xs"
        >
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push("/assessment")}
            className="text-base tracking-wide"
          >
            Begin Assessment
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
