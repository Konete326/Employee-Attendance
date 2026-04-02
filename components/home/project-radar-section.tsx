"use client";
import React from "react";
import { motion } from "framer-motion";
import { Radar, IconContainer } from "@/components/ui/radar-effect";
import {
  Clock,
  Users,
  BarChart3,
  DollarSign,
  CalendarCheck,
  Bell,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Clock className="h-6 w-6 text-sky-400" />,
    text: "Time Tracking",
    delay: 0.1,
  },
  {
    icon: <DollarSign className="h-6 w-6 text-emerald-400" />,
    text: "Payroll",
    delay: 0.3,
  },
  {
    icon: <CalendarCheck className="h-6 w-6 text-violet-400" />,
    text: "Leave Mgmt",
    delay: 0.2,
  },
  {
    icon: <Bell className="h-6 w-6 text-amber-400" />,
    text: "Notifications",
    delay: 0.5,
  },
  {
    icon: <FileSpreadsheet className="h-6 w-6 text-pink-400" />,
    text: "Excel Export",
    delay: 0.7,
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
    text: "Analytics",
    delay: 0.6,
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-green-400" />,
    text: "Role Access",
    delay: 0.4,
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-400" />,
    text: "Employee Mgmt",
    delay: 0.8,
  },
];

const stats = [
  { label: "Features", value: "12+" },
  { label: "API Routes", value: "30+" },
  { label: "Roles", value: "2" },
  { label: "Modules", value: "6" },
];

export default function ProjectRadarSection() {
  return (
    <section className="relative w-full px-4 py-16 md:py-24">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <span className="mb-3 inline-block rounded-full border border-[var(--neu-accent)]/30 bg-[var(--neu-accent)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--neu-accent)]">
          Platform Overview
        </span>
        <h2 className="text-3xl font-bold text-[var(--neu-text)] md:text-4xl">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-[var(--neu-accent)] to-purple-400 bg-clip-text text-transparent">
            Manage Attendance
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--neu-text-secondary)] md:text-base">
          AttendEase is a complete Role-Based HR platform — built for small to
          mid-sized teams who need powerful tools without the enterprise price
          tag.
        </p>
      </motion.div>

      {/* Radar + Icons Grid */}
      <div className="relative mx-auto flex h-[420px] w-full max-w-3xl flex-col items-center justify-center overflow-hidden">
        {/* Top Row */}
        <div className="mx-auto mb-6 w-full max-w-3xl">
          <div className="flex w-full items-center justify-center gap-6 sm:justify-between sm:gap-0">
            {features.slice(0, 3).map((f) => (
              <IconContainer key={f.text} icon={f.icon} text={f.text} delay={f.delay} />
            ))}
          </div>
        </div>

        {/* Middle Row */}
        <div className="mx-auto mb-6 w-full max-w-md">
          <div className="flex w-full items-center justify-center gap-8 sm:justify-between sm:gap-0">
            {features.slice(3, 5).map((f) => (
              <IconContainer key={f.text} icon={f.icon} text={f.text} delay={f.delay} />
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex w-full items-center justify-center gap-6 sm:justify-between sm:gap-0">
            {features.slice(5, 8).map((f) => (
              <IconContainer key={f.text} icon={f.icon} text={f.text} delay={f.delay} />
            ))}
          </div>
        </div>

        {/* Radar sweep centered */}
        <Radar className="absolute -bottom-16" />

        {/* Bottom line gradient */}
        <div className="absolute bottom-0 z-[41] h-px w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      </div>

    </section>
  );
}
