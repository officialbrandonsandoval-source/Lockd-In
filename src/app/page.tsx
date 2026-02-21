'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, Variants } from 'framer-motion';

/* ============================================================
   Animation Variants
   ============================================================ */

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

/* ============================================================
   Reusable Section Wrapper with useInView
   ============================================================ */

function AnimatedSection({
  children,
  className = '',
  variants = fadeIn,
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ============================================================
   Feature Icons (simple inline SVGs)
   ============================================================ */

function IconPurpose() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="8" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" fill="#C9A84C" />
    </svg>
  );
}

function IconFamily() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L28 12V28H4V12L16 4Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="12" y="18" width="8" height="10" stroke="#C9A84C" strokeWidth="1.5" />
      <line x1="16" y1="12" x2="16" y2="16" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCoaching() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="24" height="18" rx="3" stroke="#C9A84C" strokeWidth="1.5" />
      <path d="M10 14H22M10 18H18" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="5" fill="#0A0A0A" stroke="#C9A84C" strokeWidth="1.5" />
      <path d="M24 22V24.5L25.5 25.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStreak() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L18.5 12H27L20.5 18L23 27L16 21.5L9 27L11.5 18L5 12H13.5L16 3Z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconPulse() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18H10L13 10L16 24L19 14L22 18H28" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="16" r="4" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="22" cy="8" r="4" stroke="#C9A84C" strokeWidth="1.5" />
      <circle cx="22" cy="24" r="4" stroke="#C9A84C" strokeWidth="1.5" />
      <line x1="13.5" y1="14" x2="18.5" y2="10" stroke="#C9A84C" strokeWidth="1.5" />
      <line x1="13.5" y1="18" x2="18.5" y2="22" stroke="#C9A84C" strokeWidth="1.5" />
    </svg>
  );
}

const featureIcons = [IconPurpose, IconFamily, IconCoaching, IconStreak, IconPulse, IconShare];

/* ============================================================
   Page Data
   ============================================================ */

const steps = [
  {
    number: '01',
    title: 'Take the Assessment',
    description:
      '30 minutes of honest questions about who you are, what you\'re building, and where you\'re going. This isn\'t a personality quiz. This is a mirror.',
  },
  {
    number: '02',
    title: 'Get Your Blueprint',
    description:
      'Our AI analyzes your responses and generates a personal Blueprint \u2014 your identity statement, purpose, family vision, 90-day targets, and daily operating system. Built specifically for you.',
  },
  {
    number: '03',
    title: 'Lock In Daily',
    description:
      'Every morning, your AI coach checks in with your priorities. Every evening, you reflect. Every week, you get a pulse report showing how you\'re tracking against your Blueprint. No fluff. No excuses. Just accountability.',
  },
];

const features = [
  {
    title: 'Purpose Discovery',
    description: 'Stop guessing why you\'re here.',
  },
  {
    title: 'Family Legacy Architecture',
    description: 'Know what your family is building.',
  },
  {
    title: 'Daily AI Coaching',
    description: 'A coach in your pocket. Morning and evening.',
  },
  {
    title: 'Streak Accountability',
    description: 'Your consistency, tracked and visible.',
  },
  {
    title: 'Weekly Pulse Reports',
    description: 'See the truth about your week.',
  },
  {
    title: 'Share Your Journey',
    description: 'Invite your brothers. Build together.',
  },
];

/* ============================================================
   Main Page Component
   ============================================================ */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] font-sans overflow-x-hidden">
      {/* =============================================
          HEADER / NAV
          ============================================= */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#2A2A2A]/50 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center">
              <span className="text-[#C9A84C] font-serif text-xl sm:text-2xl font-bold tracking-[0.15em]">
                LOCKD IN
              </span>
            </Link>
            <Link
              href="/login"
              className="bg-[#C9A84C] text-[#0A0A0A] px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#d4b55e] transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] active:scale-[0.97]"
            >
              Start Your Blueprint
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* =============================================
          HERO SECTION
          ============================================= */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Gold gradient glow behind hero text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,rgba(201,168,76,0.03)_40%,transparent_70%)]" />
        </div>
        {/* Subtle top-down gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A0A0A_0%,transparent_30%,transparent_70%,#0A0A0A_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6 sm:mb-8"
          >
            <span className="text-[#F5F0E8]">It&apos;s time to </span>
            <span className="text-shimmer">lock in.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-base sm:text-lg md:text-xl text-[#8A8578] max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-2"
          >
            Most men are drifting. Working hard but going nowhere. Busy but not building.
            Lockd In is the AI-powered system that helps you discover your God-given purpose,
            build a legacy for your family, and show up every single day with clarity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] px-8 py-4 sm:px-10 sm:py-5 rounded-xl text-base sm:text-lg font-bold hover:bg-[#d4b55e] transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.35)] active:scale-[0.97] group"
            >
              Start Your Blueprint — Free
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 rounded-full border-2 border-[#2A2A2A] flex items-start justify-center pt-2"
            >
              <div className="w-1 h-2.5 rounded-full bg-[#C9A84C]/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =============================================
          HOW IT WORKS SECTION
          ============================================= */}
      <AnimatedSection
        className="relative py-20 sm:py-28 px-4 sm:px-6"
        variants={staggerContainer}
        threshold={0.1}
      >
        {/* Section separator line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeIn} className="text-center mb-14 sm:mb-20">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F0E8] mb-4">
              How It Works
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto rounded-full" />
          </motion.div>

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={staggerItem}
                className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 sm:p-8 md:p-10 group hover:border-[#C9A84C]/30 transition-all duration-500"
              >
                {/* Gold left border accent */}
                <div className="absolute left-0 top-6 bottom-6 w-[3px] bg-gradient-to-b from-[#C9A84C] to-[#C9A84C]/20 rounded-full" />

                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 pl-4 sm:pl-6">
                  {/* Number badge */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#C9A84C]/30 flex items-center justify-center">
                    <span className="text-[#C9A84C] font-serif text-lg font-bold">{step.number}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#E8E0D0] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[#8A8578] text-base sm:text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* =============================================
          FEATURES SECTION
          ============================================= */}
      <AnimatedSection
        className="relative py-20 sm:py-28 px-4 sm:px-6 bg-[#141414]/50"
        variants={staggerContainer}
        threshold={0.08}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeIn} className="text-center mb-14 sm:mb-20">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F5F0E8] mb-4">
              Everything You Need
            </h2>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const IconComponent = featureIcons[index];
              return (
                <motion.div
                  key={feature.title}
                  variants={staggerItem}
                  className="group relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 sm:p-8 transition-all duration-500 hover:border-[#C9A84C]/40 hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]"
                >
                  {/* Icon */}
                  <div className="mb-5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <IconComponent />
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#E8E0D0] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#8A8578] text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover glow accent */}
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(201,168,76,0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* =============================================
          BOTTOM CTA SECTION
          ============================================= */}
      <AnimatedSection
        className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden"
        variants={fadeIn}
      >
        {/* Gold radial gradient background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] sm:w-[900px] sm:h-[900px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,rgba(201,168,76,0.02)_40%,transparent_70%)]" />
        </div>

        {/* Top separator */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.p
            variants={fadeIn}
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#F5F0E8] leading-snug mb-4"
          >
            Lockd In is 100% free.
          </motion.p>
          <motion.p
            variants={fadeIn}
            className="text-[#8A8578] text-base sm:text-lg md:text-xl leading-relaxed mb-10 sm:mb-14 max-w-xl mx-auto"
          >
            No credit card. No trial. No catch. Just a man and his Blueprint.
          </motion.p>

          <motion.div variants={scaleIn}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] px-8 py-4 sm:px-10 sm:py-5 rounded-xl text-base sm:text-lg font-bold hover:bg-[#d4b55e] transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.35)] active:scale-[0.97] group"
            >
              Start Your Blueprint
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* =============================================
          FOOTER
          ============================================= */}
      <footer className="relative py-10 sm:py-12 px-4 sm:px-6 border-t border-[#2A2A2A]/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#8A8578] text-sm sm:text-base">
            All glory to God. Built with purpose. Lockd In &copy; 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
