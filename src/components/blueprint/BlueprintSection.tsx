'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlueprintSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function BlueprintSection({
  title,
  icon,
  children,
  className = '',
}: BlueprintSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl
        border-l-2 border-l-[#C9A84C]
        overflow-hidden
        ${className}
      `}
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <h2 className="font-display text-lg text-[#E8E0D0] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Section content */}
      <div className="px-6 pb-6">{children}</div>
    </motion.section>
  );
}
