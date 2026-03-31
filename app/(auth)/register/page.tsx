"use client";

import dynamic from "next/dynamic";
import RegisterForm from "@/components/auth/register-form";

// Dynamically import NeuralBackground to avoid SSR issues with canvas
const NeuralBackground = dynamic(
  () => import("@/components/ui/flow-field-background"),
  { ssr: false }
);

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Neural Background */}
      <NeuralBackground
        color="#818cf8"
        particleCount={600}
        speed={0.8}
        trailOpacity={0.15}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* App Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-[var(--neu-accent)]">Attend</span>Ease
            </h1>
            <p className="text-[var(--neu-text-secondary)]">
              Create your account
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
