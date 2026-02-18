'use client';

import type {
  Blueprint,
  CoreValue,
  NinetyDayTarget,
  DailyNonNegotiable,
} from '@/lib/supabase/types';
import IdentityStatement from './IdentityStatement';
import BlueprintSection from './BlueprintSection';

interface BlueprintDocumentProps {
  blueprint: Blueprint;
}

// ---------------------------------------------------------------------------
// Section icon components (inline SVGs to avoid external deps)
// ---------------------------------------------------------------------------

function PurposeIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ValuesIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function FaithIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function FinanceIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function RelationshipIcon() {
  return (
    <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlueprintDocument({
  blueprint,
}: BlueprintDocumentProps) {
  const {
    identity_statement,
    purpose_statement,
    family_vision,
    core_values,
    ninety_day_targets,
    daily_non_negotiables,
    faith_commitments,
    health_targets,
    financial_targets,
    relationship_commitments,
  } = blueprint;

  return (
    <div className="space-y-6">
      {/* Identity Statement -- hero display */}
      {identity_statement && (
        <IdentityStatement statement={identity_statement} />
      )}

      {/* Purpose Statement */}
      {purpose_statement && (
        <BlueprintSection title="Purpose Statement" icon={<PurposeIcon />}>
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-base">
            {purpose_statement}
          </p>
        </BlueprintSection>
      )}

      {/* Family Vision */}
      {family_vision && (
        <BlueprintSection title="Family Vision" icon={<FamilyIcon />}>
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-base whitespace-pre-line">
            {family_vision}
          </p>
        </BlueprintSection>
      )}

      {/* Core Values */}
      {core_values && core_values.length > 0 && (
        <BlueprintSection title="Core Values" icon={<ValuesIcon />}>
          <div className="space-y-4">
            {(core_values as CoreValue[]).map((val, i) => (
              <div
                key={i}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-md font-sans tabular-nums flex-shrink-0">
                    {val.rank ?? i + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-display text-[#E8E0D0] text-base mb-1">
                      {val.value}
                    </h4>
                    <p className="text-sm text-[#8A8578] font-sans leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BlueprintSection>
      )}

      {/* 90-Day Targets */}
      {ninety_day_targets && ninety_day_targets.length > 0 && (
        <BlueprintSection title="90-Day Targets" icon={<TargetIcon />}>
          <div className="space-y-3">
            {(ninety_day_targets as NinetyDayTarget[]).map((target, i) => (
              <div
                key={i}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-md font-sans uppercase tracking-wider">
                    {target.area}
                  </span>
                  {target.deadline && (
                    <span className="text-[10px] text-[#8A8578] font-sans ml-auto">
                      Due: {target.deadline}
                    </span>
                  )}
                </div>
                <h4 className="text-[#F5F0E8] font-sans font-medium text-sm mb-1">
                  {target.target}
                </h4>
                <p className="text-xs text-[#8A8578] font-sans">
                  Measure: {target.measure}
                </p>
              </div>
            ))}
          </div>
        </BlueprintSection>
      )}

      {/* Daily Non-Negotiables */}
      {daily_non_negotiables && daily_non_negotiables.length > 0 && (
        <BlueprintSection
          title="Daily Non-Negotiables"
          icon={<ChecklistIcon />}
        >
          <ul className="space-y-3">
            {(daily_non_negotiables as DailyNonNegotiable[]).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#C9A84C]/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-sm text-[#F5F0E8] font-sans font-medium">
                    {item.activity}
                  </p>
                  {(item.time_of_day || item.duration_minutes) && (
                    <p className="text-xs text-[#8A8578] font-sans mt-0.5">
                      {item.time_of_day && <span>{item.time_of_day}</span>}
                      {item.time_of_day && item.duration_minutes && (
                        <span> &middot; </span>
                      )}
                      {item.duration_minutes && (
                        <span>{item.duration_minutes} min</span>
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </BlueprintSection>
      )}

      {/* Faith Commitments */}
      {faith_commitments && (
        <BlueprintSection title="Faith Commitments" icon={<FaithIcon />}>
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-sm whitespace-pre-line">
            {faith_commitments}
          </p>
        </BlueprintSection>
      )}

      {/* Health Targets */}
      {health_targets && (
        <BlueprintSection title="Health Targets" icon={<HealthIcon />}>
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-sm whitespace-pre-line">
            {health_targets}
          </p>
        </BlueprintSection>
      )}

      {/* Financial Targets */}
      {financial_targets && (
        <BlueprintSection title="Financial Targets" icon={<FinanceIcon />}>
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-sm whitespace-pre-line">
            {financial_targets}
          </p>
        </BlueprintSection>
      )}

      {/* Relationship Commitments */}
      {relationship_commitments && (
        <BlueprintSection
          title="Relationship Commitments"
          icon={<RelationshipIcon />}
        >
          <p className="text-[#F5F0E8] font-sans leading-relaxed text-sm whitespace-pre-line">
            {relationship_commitments}
          </p>
        </BlueprintSection>
      )}
    </div>
  );
}
