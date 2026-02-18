"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import Button from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CoreValue {
  name: string;
  description: string;
  daily_practice: string;
}

interface NinetyDayTarget {
  area: string;
  target: string;
  measurement: string;
}

interface DailyNonNegotiable {
  practice: string;
  time: string | null;
}

interface FaithCommitment {
  practice: string;
  frequency: string;
}

interface HealthTarget {
  target: string;
  measurement: string;
}

interface FinancialTarget {
  target: string;
  timeline: string;
}

interface RelationshipCommitment {
  relationship: string;
  commitment: string;
}

interface BlueprintData {
  id: string;
  identity_statement: string | null;
  purpose_statement: string | null;
  family_vision: string | null;
  core_values: CoreValue[] | null;
  ninety_day_targets: NinetyDayTarget[] | null;
  daily_non_negotiables: DailyNonNegotiable[] | null;
  faith_commitments: FaithCommitment[] | string | null;
  health_targets: HealthTarget[] | string | null;
  financial_targets: FinancialTarget[] | string | null;
  relationship_commitments: RelationshipCommitment[] | string | null;
}

// ---------------------------------------------------------------------------
// Animated Section Wrapper
// ---------------------------------------------------------------------------

function RevealSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Blueprint Card
// ---------------------------------------------------------------------------

function BlueprintCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
      {/* Gold left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C9A84C]" />
      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <h3 className="font-display text-[#C9A84C] text-sm uppercase tracking-[0.15em] mb-4">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typewriter Effect
// ---------------------------------------------------------------------------

function TypewriterText({
  text,
  onComplete,
  speed = 35,
}: {
  text: string;
  onComplete?: () => void;
  speed?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-[#C9A84C] ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BlueprintRevealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get("id");

  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reveal sequence states
  const [showBlack, setShowBlack] = useState(true);
  const [showIdentity, setShowIdentity] = useState(false);
  const [, setIdentityDone] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [showFullBlueprint, setShowFullBlueprint] = useState(false);

  // Fetch the blueprint
  useEffect(() => {
    async function fetchBlueprint() {
      try {
        const url = blueprintId
          ? `/api/blueprint/generate?id=${blueprintId}`
          : `/api/blueprint/generate`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to load your Blueprint");
        }
        const data = await res.json();
        setBlueprint(data.blueprint || data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load Blueprint"
        );
        setLoading(false);
      }
    }
    fetchBlueprint();
  }, [blueprintId]);

  // Cinematic reveal sequence
  useEffect(() => {
    if (loading || !blueprint) return;

    // Step 1: Black screen pause
    const t1 = setTimeout(() => setShowBlack(false), 1200);
    // Step 2: Show identity
    const t2 = setTimeout(() => setShowIdentity(true), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, blueprint]);

  // After identity typewriter finishes
  const onIdentityComplete = useCallback(() => {
    setIdentityDone(true);
    setTimeout(() => setShowPurpose(true), 800);
  }, []);

  // After purpose fades in, show family
  useEffect(() => {
    if (!showPurpose) return;
    const t = setTimeout(() => setShowFamily(true), 1500);
    return () => clearTimeout(t);
  }, [showPurpose]);

  // After family, show scroll hint and full blueprint
  useEffect(() => {
    if (!showFamily) return;
    const t1 = setTimeout(() => setShowScrollHint(true), 1500);
    const t2 = setTimeout(() => setShowFullBlueprint(true), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showFamily]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#C9A84C] font-display text-xl"
        >
          Loading your Blueprint...
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !blueprint) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <p className="text-[#8B2500] font-sans text-base mb-4">
          {error || "Blueprint not found"}
        </p>
        <button
          onClick={() => router.push("/generating")}
          className="text-[#C9A84C] font-sans text-sm underline underline-offset-4"
        >
          Try generating again
        </button>
      </div>
    );
  }

  // Helper to safely parse JSON strings that may be stored as strings
  function parseJsonField<T>(field: T | string | null): T | null {
    if (!field) return null;
    if (typeof field === "string") {
      try {
        return JSON.parse(field) as T;
      } catch {
        return null;
      }
    }
    return field;
  }

  const coreValues = blueprint.core_values;
  const targets = blueprint.ninety_day_targets;
  const dailyNonNeg = blueprint.daily_non_negotiables;
  const faithComm = parseJsonField<FaithCommitment[]>(blueprint.faith_commitments);
  const healthTgt = parseJsonField<HealthTarget[]>(blueprint.health_targets);
  const financialTgt = parseJsonField<FinancialTarget[]>(blueprint.financial_targets);
  const relComm = parseJsonField<RelationshipCommitment[]>(blueprint.relationship_commitments);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* ============================================================= */}
      {/* CINEMATIC REVEAL SECTION */}
      {/* ============================================================= */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
        {/* Black screen overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showBlack ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 bg-[#0A0A0A] z-30 pointer-events-none"
        />

        {/* Identity Statement */}
        {showIdentity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-center mb-12 relative z-20"
          >
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C9A84C]/70 block mb-6">
              Your Identity
            </span>
            <h1 className="font-display text-[#F5F0E8] text-2xl sm:text-3xl md:text-4xl leading-relaxed">
              <TypewriterText
                text={blueprint.identity_statement || ""}
                onComplete={onIdentityComplete}
                speed={30}
              />
            </h1>
          </motion.div>
        )}

        {/* Purpose Statement */}
        {showPurpose && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-2xl text-center mb-10 relative z-20"
          >
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C9A84C]/70 block mb-4">
              Your Purpose
            </span>
            <p className="font-display text-[#E8E0D0] text-lg sm:text-xl md:text-2xl leading-relaxed">
              {blueprint.purpose_statement}
            </p>
          </motion.div>
        )}

        {/* Family Vision */}
        {showFamily && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-2xl text-center mb-12 relative z-20"
          >
            <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#C9A84C]/70 block mb-4">
              Your Family Vision
            </span>
            <p className="font-display text-[#E8E0D0]/90 text-base sm:text-lg md:text-xl leading-relaxed">
              {blueprint.family_vision}
            </p>
          </motion.div>
        )}

        {/* Scroll hint */}
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-10 left-0 right-0 flex flex-col items-center z-20"
          >
            <span className="text-sm font-sans text-[#8A8578] mb-3">
              Scroll to see your full Blueprint
            </span>
            <motion.svg
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-6 text-[#C9A84C]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </motion.svg>
          </motion.div>
        )}
      </div>

      {/* ============================================================= */}
      {/* FULL BLUEPRINT SECTIONS */}
      {/* ============================================================= */}
      {showFullBlueprint && (
        <div className="max-w-3xl mx-auto px-6 pb-24 space-y-8">
          {/* Core Values */}
          {coreValues && coreValues.length > 0 && (
            <RevealSection>
              <BlueprintCard title="Core Values">
                <div className="space-y-5">
                  {coreValues.map((v, i) => (
                    <div key={i}>
                      <h4 className="font-display text-[#F5F0E8] text-base mb-1">
                        {v.name}
                      </h4>
                      <p className="text-[#8A8578] font-sans text-sm leading-relaxed mb-1">
                        {v.description}
                      </p>
                      <p className="text-[#C9A84C]/80 font-sans text-xs italic">
                        Daily practice: {v.daily_practice}
                      </p>
                    </div>
                  ))}
                </div>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* 90-Day Targets */}
          {targets && targets.length > 0 && (
            <RevealSection delay={0.1}>
              <BlueprintCard title="90-Day Targets">
                <div className="space-y-4">
                  {targets.map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-[#C9A84C] font-sans text-xs uppercase tracking-wider mt-0.5 flex-shrink-0 w-20">
                        {t.area}
                      </span>
                      <div>
                        <p className="text-[#F5F0E8] font-sans text-sm">
                          {t.target}
                        </p>
                        <p className="text-[#8A8578] font-sans text-xs mt-0.5">
                          Measure: {t.measurement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* Daily Non-Negotiables */}
          {dailyNonNeg && dailyNonNeg.length > 0 && (
            <RevealSection delay={0.1}>
              <BlueprintCard title="Daily Non-Negotiables">
                <ul className="space-y-3">
                  {dailyNonNeg.map((d, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                        &bull;
                      </span>
                      <div>
                        <span className="text-[#F5F0E8] font-sans text-sm">
                          {d.practice}
                        </span>
                        {d.time && (
                          <span className="text-[#8A8578] font-sans text-xs ml-2">
                            ({d.time})
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* Faith Commitments */}
          {faithComm && Array.isArray(faithComm) && faithComm.length > 0 && (
            <RevealSection delay={0.1}>
              <BlueprintCard title="Faith Commitments">
                <ul className="space-y-3">
                  {faithComm.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                        &bull;
                      </span>
                      <div>
                        <span className="text-[#F5F0E8] font-sans text-sm">
                          {f.practice}
                        </span>
                        <span className="text-[#8A8578] font-sans text-xs ml-2">
                          ({f.frequency})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* Health Targets */}
          {healthTgt && Array.isArray(healthTgt) && healthTgt.length > 0 && (
            <RevealSection delay={0.1}>
              <BlueprintCard title="Health Targets">
                <ul className="space-y-3">
                  {healthTgt.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                        &bull;
                      </span>
                      <div>
                        <span className="text-[#F5F0E8] font-sans text-sm">
                          {h.target}
                        </span>
                        <p className="text-[#8A8578] font-sans text-xs mt-0.5">
                          Measure: {h.measurement}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* Financial Targets */}
          {financialTgt &&
            Array.isArray(financialTgt) &&
            financialTgt.length > 0 && (
              <RevealSection delay={0.1}>
                <BlueprintCard title="Financial Targets">
                  <ul className="space-y-3">
                    {financialTgt.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                          &bull;
                        </span>
                        <div>
                          <span className="text-[#F5F0E8] font-sans text-sm">
                            {f.target}
                          </span>
                          <span className="text-[#8A8578] font-sans text-xs ml-2">
                            ({f.timeline})
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </BlueprintCard>
              </RevealSection>
            )}

          {/* Relationship Commitments */}
          {relComm && Array.isArray(relComm) && relComm.length > 0 && (
            <RevealSection delay={0.1}>
              <BlueprintCard title="Relationship Commitments">
                <ul className="space-y-3">
                  {relComm.map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">
                        &bull;
                      </span>
                      <div>
                        <span className="text-[#F5F0E8] font-sans text-sm font-medium">
                          {r.relationship}:
                        </span>{" "}
                        <span className="text-[#8A8578] font-sans text-sm">
                          {r.commitment}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </BlueprintCard>
            </RevealSection>
          )}

          {/* CTA: Save & Lock In */}
          <RevealSection delay={0.2}>
            <div className="flex flex-col items-center pt-8 pb-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-8"
              >
                <p className="font-display text-[#E8E0D0] text-xl sm:text-2xl mb-2">
                  This is your Blueprint.
                </p>
                <p className="font-sans text-[#8A8578] text-sm">
                  Your purpose. Your plan. Your daily operating system.
                </p>
              </motion.div>

              <Button
                size="lg"
                fullWidth
                className="max-w-sm text-base tracking-wide"
                onClick={() => router.push("/app/dashboard")}
              >
                Save &amp; Lock In
              </Button>
            </div>
          </RevealSection>
        </div>
      )}
    </div>
  );
}
