"use client";

import dynamic from "next/dynamic";

const NeuralBackground = dynamic(
  () => import("@/components/ui/flow-field-background"),
  { ssr: false }
);

interface AnimatedBackgroundProps {
  color?: string;
  particleCount?: number;
  speed?: number;
  trailOpacity?: number;
}

export function AnimatedBackground({
  color = "#818cf8",
  particleCount = 600,
  speed = 0.8,
  trailOpacity = 0.15,
}: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0">
      <NeuralBackground
        color={color}
        particleCount={particleCount}
        speed={speed}
        trailOpacity={trailOpacity}
      />
    </div>
  );
}
