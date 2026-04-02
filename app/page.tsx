"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, LogIn, LayoutDashboard, BarChart3 } from "lucide-react";
import NeuralBackground from "@/components/ui/flow-field-background";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import ProjectRadarSection from "@/components/home/project-radar-section";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <LogIn className="w-8 h-8 text-[var(--neu-accent)]" />,
      title: "Quick Check-in",
      description:
        "One-click check-in and check-out with automatic time tracking",
    },
    {
      icon: <LayoutDashboard className="w-8 h-8 text-[var(--neu-accent)]" />,
      title: "Admin Dashboard",
      description:
        "Comprehensive overview of attendance, reports, and employee management",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[var(--neu-accent)]" />,
      title: "Detailed Reports",
      description:
        "Weekly and monthly reports with attendance stats and export options",
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Neural Background - Fixed behind all content */}
      <div className="fixed inset-0 z-0">
        <NeuralBackground
          color="#818cf8"
          trailOpacity={0.1}
          speed={0.8}
          particleCount={600}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col flex-1">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Logo/Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--neu-surface)] shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]">
                <Clock className="w-10 h-10 text-[var(--neu-accent)]" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[var(--neu-accent)] to-purple-400 bg-clip-text text-transparent">
                AttendEase
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-[var(--neu-text)] mb-3">
              Smart Employee Attendance Management
            </p>

            {/* Description */}
            <p className="text-base md:text-lg text-[var(--neu-text-muted)] mb-8 max-w-xl mx-auto">
              Track attendance, manage employees, and generate detailed reports
              — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <NeuButton variant="accent" size="lg">
                  Get Started
                </NeuButton>
              </Link>
              <Link href="/register">
                <NeuButton variant="ghost" size="lg">
                  Register
                </NeuButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 pb-16">
          <div
            className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ease-out delay-300 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {features.map((feature, index) => (
              <NeuCard
                key={index}
                variant="raised"
                hover
                className="text-center"
              >
                <NeuCardContent>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-[var(--neu-text)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--neu-text-secondary)]">
                    {feature.description}
                  </p>
                </NeuCardContent>
              </NeuCard>
            ))}
          </div>
        </section>

        {/* Project Details Radar Section */}
        <ProjectRadarSection />

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center">
          <p className="text-sm text-[var(--neu-text-muted)]">
            © 2026 AttendEase
          </p>
        </footer>
      </main>
    </div>
  );
}
