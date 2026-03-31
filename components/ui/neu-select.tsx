"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface NeuSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const NeuSelect = React.forwardRef<HTMLSelectElement, NeuSelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--neu-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-4 py-2.5 rounded-[var(--neu-radius)]",
              "appearance-none cursor-pointer",
              "bg-[var(--neu-surface)] text-[var(--neu-text)]",
              "border border-[var(--neu-border)]",
              "shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-[var(--neu-accent)] focus:shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light),0_0_0_3px_rgba(129,140,248,0.2)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--neu-danger)] focus:border-[var(--neu-danger)] focus:shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light),0_0_0_3px_rgba(248,113,113,0.2)]",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--neu-text-muted)]">
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
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--neu-danger)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NeuSelect.displayName = "NeuSelect";

export { NeuSelect, type NeuSelectProps, type SelectOption };
