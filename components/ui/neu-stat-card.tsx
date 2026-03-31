"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface NeuStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: TrendDirection;
  trendValue?: string;
}

const trendStyles: Record<TrendDirection, { color: string; icon: React.ReactNode }> = {
  up: {
    color: "text-[var(--neu-success)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ),
  },
  down: {
    color: "text-[var(--neu-danger)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
  },
  neutral: {
    color: "text-[var(--neu-text-muted)]",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
};

const NeuStatCard = React.forwardRef<HTMLDivElement, NeuStatCardProps>(
  (
    { className, title, value, subtitle, icon, trend = "neutral", trendValue, ...props },
    ref
  ) => {
    const trendStyle = trendStyles[trend];

    return (
      <div
        ref={ref}
        className={cn(
          "p-6 rounded-[var(--neu-radius)]",
          "bg-[var(--neu-surface)]",
          "border border-[var(--neu-border)]",
          "shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]",
          "transition-all duration-200 ease-out",
          "hover:-translate-y-1 hover:shadow-[10px_10px_20px_var(--neu-shadow-dark),-10px_-10px_20px_var(--neu-shadow-light)]",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--neu-text-secondary)]">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-[var(--neu-text)]">
              {value}
            </p>
            {(subtitle || trendValue) && (
              <div className="mt-2 flex items-center gap-2">
                {trendValue && (
                  <span className={cn("flex items-center gap-0.5 text-sm font-medium", trendStyle.color)}>
                    {trendStyle.icon}
                    {trendValue}
                  </span>
                )}
                {subtitle && (
                  <span className="text-sm text-[var(--neu-text-muted)]">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-[var(--neu-radius)] bg-[var(--neu-accent)]/20 text-[var(--neu-accent)]">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

NeuStatCard.displayName = "NeuStatCard";

export { NeuStatCard, type NeuStatCardProps, type TrendDirection };
