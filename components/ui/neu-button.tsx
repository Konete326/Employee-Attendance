"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "accent" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: `
    bg-[var(--neu-surface)] text-[var(--neu-text)]
    border border-[var(--neu-border)]
    shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]
    hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]
    hover:-translate-y-0.5
    active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]
    active:translate-y-0
  `,
  accent: `
    bg-[var(--neu-accent)] text-white
    border border-[var(--neu-border)]
    shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]
    hover:bg-[var(--neu-accent-hover)]
    hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]
    hover:-translate-y-0.5
    active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]
    active:translate-y-0
  `,
  ghost: `
    bg-transparent text-[var(--neu-text)]
    border border-transparent
    hover:bg-[var(--neu-surface-light)]
    hover:text-[var(--neu-accent)]
  `,
  danger: `
    bg-[var(--neu-danger)] text-white
    border border-[var(--neu-border)]
    shadow-[8px_8px_16px_var(--neu-shadow-dark),-8px_-8px_16px_var(--neu-shadow-light)]
    hover:brightness-110
    hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]
    hover:-translate-y-0.5
    active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]
    active:translate-y-0
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-[0.5rem]",
  md: "px-4 py-2 text-base rounded-[var(--neu-radius)]",
  lg: "px-6 py-3 text-lg rounded-[calc(var(--neu-radius)+0.25rem)]",
  icon: "p-2 rounded-[var(--neu-radius)] aspect-square",
};

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  (
    { className, variant = "default", size = "md", loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 font-medium",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--neu-bg)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

NeuButton.displayName = "NeuButton";

export { NeuButton, type NeuButtonProps, type ButtonVariant, type ButtonSize };
