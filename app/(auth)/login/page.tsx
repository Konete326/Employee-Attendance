"use client";

import dynamic from "next/dynamic";
import LoginForm from "@/components/auth/login-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Dynamically import NeuralBackground to avoid SSR issues with canvas
const NeuralBackground = dynamic(
  () => import("@/components/ui/flow-field-background"),
  { ssr: false }
);

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Neural Background */}
      <NeuralBackground
        color="#818cf8"
        particleCount={600}
        speed={0.8}
        trailOpacity={0.15}
      />

      {/* Back to Home button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--neu-surface)]/80 backdrop-blur-sm border border-[var(--neu-border)] text-[var(--neu-text-secondary)] hover:text-[var(--neu-accent)] hover:border-[var(--neu-accent)]/40 transition-all duration-200 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-16">
        <div className="w-full max-w-md">
          {/* App Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-[var(--neu-accent)]">Attend</span>Ease
            </h1>
            <p className="text-[var(--neu-text-secondary)]">
              Role-Based Employee Attendance System
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
