"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "present" | "absent" | "late" | "default" | "accent" | "success" | "error" | "warning";

interface NeuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { dot: string; bg: string; text: string }> = {
  present: {
    dot: "bg-[var(--neu-success)]",
    bg: "bg-[rgba(52,211,153,0.15)]",
    text: "text-[var(--neu-success)]",
  },
  absent: {
    dot: "bg-[var(--neu-danger)]",
    bg: "bg-[rgba(248,113,113,0.15)]",
    text: "text-[var(--neu-danger)]",
  },
  late: {
    dot: "bg-[var(--neu-warning)]",
    bg: "bg-[rgba(251,191,36,0.15)]",
    text: "text-[var(--neu-warning)]",
  },
  default: {
    dot: "bg-[var(--neu-text-secondary)]",
    bg: "bg-[rgba(148,163,184,0.15)]",
    text: "text-[var(--neu-text-secondary)]",
  },
  accent: {
    dot: "bg-[var(--neu-accent)]",
    bg: "bg-[rgba(129,140,248,0.15)]",
    text: "text-[var(--neu-accent)]",
  },
  success: {
    dot: "bg-[var(--neu-success)]",
    bg: "bg-[rgba(52,211,153,0.15)]",
    text: "text-[var(--neu-success)]",
  },
  error: {
    dot: "bg-[var(--neu-danger)]",
    bg: "bg-[rgba(248,113,113,0.15)]",
    text: "text-[var(--neu-danger)]",
  },
  warning: {
    dot: "bg-[var(--neu-warning)]",
    bg: "bg-[rgba(251,191,36,0.15)]",
    text: "text-[var(--neu-warning)]",
  },
};

const NeuBadge = React.forwardRef<HTMLSpanElement, NeuBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const styles = variantStyles[variant];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1",
          "rounded-full text-xs font-medium",
          "border border-[var(--neu-border)]",
          styles.bg,
          styles.text,
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            styles.dot
          )}
        />
        {children}
      </span>
    );
  }
);

NeuBadge.displayName = "NeuBadge";

export { NeuBadge, type NeuBadgeProps, type BadgeVariant };
