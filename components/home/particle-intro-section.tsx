"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

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
    <section className="relative w-full px-4 py-12 md:py-20">
      {/* ── Headings ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mb-8 text-center"
      >
        <span className="mb-3 inline-block rounded-full border border-[var(--neu-accent)]/30 bg-[var(--neu-accent)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--neu-accent)]">
          Interactive Introduction
        </span>
        <h2 className="text-3xl font-bold text-[var(--neu-text)] md:text-4xl">
          Meet{" "}
          <span className="bg-gradient-to-r from-[var(--neu-accent)] to-purple-400 bg-clip-text text-transparent">
            AttendEase
          </span>
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--neu-text-secondary)] md:text-base">
          Watch every feature come to life — particles rearrange into the next
          idea every few seconds. Right-click to scatter them.
        </p>
      </motion.div>

      {/* ── Canvas wrapper ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto w-full max-w-4xl rounded-2xl border border-[var(--neu-accent)]/10 p-1 shadow-[0_0_60px_-10px_rgba(129,140,248,0.25)]"
        style={{
          background:
            "linear-gradient(135deg,rgba(129,140,248,0.08),rgba(99,102,241,0.03))",
        }}
      >
        <ParticleTextEffect
          words={PROJECT_WORDS}
          canvasWidth={1000}
          canvasHeight={280}
          intervalMs={3000}
        />
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

      {/* ── Info card row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {[
          {
            stat: "30+",
            label: "API Routes",
            desc: "Fully typed Next.js route handlers",
          },
          {
            stat: "2",
            label: "Roles",
            desc: "Admin & Employee with JWT guards",
          },
          {
            stat: "6",
            label: "Modules",
            desc: "Attendance · Leave · Payroll · Reports · Audit · Notifications",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center rounded-2xl border border-[var(--neu-border)] px-4 py-5 text-center"
            style={{
              background: "var(--neu-surface)",
              boxShadow:
                "4px 4px 8px var(--neu-shadow-dark),-4px -4px 8px var(--neu-shadow-light)",
            }}
          >
            <span
              className="text-3xl font-extrabold"
              style={{
                background:
                  "linear-gradient(135deg,var(--neu-accent),#c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {item.stat}
            </span>
            <span className="mt-1 text-sm font-semibold text-[var(--neu-text)]">
              {item.label}
            </span>
            <span className="mt-1 text-xs text-[var(--neu-text-secondary)]">
              {item.desc}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
