"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import InviteFlow from "@/components/share/InviteFlow";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function InviteClient() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [referralStats, setReferralStats] = useState<{
    totalInvites: number;
    signedUp: number;
  }>({ totalInvites: 0, signedUp: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Generate a referral code from the user's ID
  const referralCode = user?.id?.slice(0, 8) || "lockdin";
  const userName = profile?.full_name?.split(" ")[0] || "King";

  // Fetch referral stats
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Count all referrals created by this user
        const { count: totalInvites } = await supabase
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", user.id);

        // Count referrals where someone actually signed up
        const { count: signedUp } = await supabase
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", user.id)
          .not("referred_id", "is", null);

        setReferralStats({
          totalInvites: totalInvites || 0,
          signedUp: signedUp || 0,
        });
      } catch (err) {
        console.error("[invite] Failed to fetch referral stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user, supabase]);

  if (profileLoading || statsLoading) {
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
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl text-[#F5F0E8]">
          Invite Your Brothers
        </h1>
        <p className="text-sm text-[#8A8578] font-sans mt-1">
          The journey is better together. Invite the men in your life who are ready to lock in.
        </p>
      </motion.div>

      {/* Invite flow */}
      <InviteFlow
        userName={userName}
        referralCode={referralCode}
        referralStats={referralStats}
      />
    </div>
  );
}
