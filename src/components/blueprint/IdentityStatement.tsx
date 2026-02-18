'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface IdentityStatementProps {
  statement: string;
}

export default function IdentityStatement({
  statement,
}: IdentityStatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 sm:p-10 text-center overflow-hidden"
    >
      {/* Gold glow behind text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-72 h-72 rounded-full opacity-[0.07]"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,1) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="relative z-10">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xs text-[#C9A84C] font-sans uppercase tracking-[0.2em] mb-6"
        >
          Identity Statement
        </motion.p>

        {/* Statement text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="font-display text-xl sm:text-2xl md:text-3xl text-[#E8E0D0] leading-relaxed"
        >
          {statement}
        </motion.p>

        {/* Decorative bottom accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"
        />
      </div>
    </motion.div>
  );
}
