"use client";

// Spinner is now an alias for ChipLoader — all existing usages automatically get the new animation
import { ChipLoader } from "@/components/ui/chip-loader";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md" }: SpinnerProps) {
  return <ChipLoader size={size} />;
}

Spinner.displayName = "Spinner";
