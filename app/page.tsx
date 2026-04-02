"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import NeuralBackground from "@/components/ui/flow-field-background";
import { NeuButton } from "@/components/ui/neu-button";
import ProjectRadarSection from "@/components/home/project-radar-section";
import { FlickeringFooter } from "@/components/ui/flickering-footer";
import { BentoGrid, attendEaseBentoItems, statsBentoItems } from "@/components/ui/bento-grid";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        {/* Stats Section - Bento Grid */}
        <section className="px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--neu-text)] mb-2">
              Powerful & Scalable
            </h2>
            <p className="text-[var(--neu-text-secondary)]">
              Built with modern tech stack for reliability and performance
            </p>
          </div>
          <BentoGrid items={statsBentoItems} />
        </section>

        {/* Main Features - Bento Grid */}
        <section className="px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--neu-text)] mb-2">
              Complete HR Platform
            </h2>
            <p className="text-[var(--neu-text-secondary)]">
              Everything you need to manage your workforce efficiently
            </p>
          </div>
          <BentoGrid items={attendEaseBentoItems} />
        </section>

        {/* Project Details Radar Section */}
        <ProjectRadarSection />

        {/* Footer */}
        <FlickeringFooter />
      </main>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
