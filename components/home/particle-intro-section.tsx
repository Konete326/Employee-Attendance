"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlowButton } from "@/components/ui/glow-button";

// ssr:false because it touches canvas / requestAnimationFrame
const ParticleTextEffect = dynamic(
  () => import("@/components/ui/particle-text-effect").then((m) => ({ default: m.ParticleTextEffect })),
  { ssr: false }
);

const PROJECT_WORDS = [
  "AttendEase",
  "GPS Check-In",
  "Payroll Engine",
  "Manage Leaves",
  "Role Access",
  "HR Platform",
  "Track Hours",
  "Admin Panel",
];

const WORD_DESCRIPTIONS: Record<string, string> = {
  "AttendEase":     "Your all-in-one HR management platform for growing teams",
  "GPS Check-In":   "Location-verified attendance with Haversine geo-fencing",
  "Payroll Engine": "Auto-calculates salary, deductions & bonuses every month",
  "Manage Leaves":  "Sick, casual, annual & unpaid leaves with balance tracking",
  "Role Access":    "Admin and employee portals with JWT role-based routing",
  "HR Platform":    "From check-in to payslip — the complete HR workflow",
  "Track Hours":    "Real-time working hours, overtime & late-arrival detection",
  "Admin Panel":    "Dashboard with charts, reports, audit logs & export tools",
};

export default function ParticleIntroSection() {
  return (
    <section className="relative w-full px-4 py-20 md:py-32">
      {/* ── Headings ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65 }}
        className="mb-12 text-center"
      >
        <span className="mb-4 inline-block rounded-full border border-[var(--neu-accent)]/30 bg-[var(--neu-accent)]/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--neu-accent)]">
          Interactive Introduction
        </span>
        <h1 className="text-4xl font-extrabold text-[var(--neu-text)] md:text-6xl lg:text-7xl">
          Meet{" "}
          <span className="bg-gradient-to-r from-[var(--neu-accent)] to-purple-400 bg-clip-text text-transparent">
            AttendEase
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--neu-text-secondary)] md:text-xl">
          Watch every feature come to life — particles rearrange into the next
          idea every few seconds. Right-click to scatter them.
        </p>
      </motion.div>

      {/* ── Canvas wrapper ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mx-auto w-full max-w-6xl rounded-[2.5rem] border border-[var(--neu-accent)]/10 p-2 shadow-[0_0_80px_-20px_rgba(129,140,248,0.3)] mb-12"
        style={{
          background:
            "linear-gradient(135deg,rgba(129,140,248,0.12),rgba(99,102,241,0.05))",
        }}
      >
        <ParticleTextEffect
          words={PROJECT_WORDS}
          canvasWidth={1200}
          canvasHeight={450}
          intervalMs={3000}
        />
      </motion.div>

      {/* ── CTA Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
      >
        <GlowButton asChild size="lg">
          <Link href="/login">Get Started</Link>
        </GlowButton>
        <GlowButton asChild variant="ghost" size="lg">
          <Link href="/register">Register</Link>
        </GlowButton>
      </motion.div>

      {/* ── Feature pills (cycle labels) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2"
      >
        {PROJECT_WORDS.map((word) => (
          <span
            key={word}
            title={WORD_DESCRIPTIONS[word]}
            className="cursor-default rounded-full border border-[var(--neu-accent)]/20 px-3 py-1 text-xs font-medium text-[var(--neu-text-secondary)] transition-colors hover:border-[var(--neu-accent)]/50 hover:text-[var(--neu-accent)]"
            style={{ background: "rgba(129,140,248,0.06)" }}
          >
            {word}
          </span>
        ))}
      </motion.div>


    </section>
  );
}
