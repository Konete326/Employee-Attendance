"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NeuInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--neu-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-2.5 rounded-[var(--neu-radius)]",
              "bg-[var(--neu-surface)] text-[var(--neu-text)]",
              "border border-[var(--neu-border)]",
              "shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]",
              "placeholder:text-[var(--neu-text-muted)]",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-[var(--neu-accent)] focus:shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light),0_0_0_3px_rgba(129,140,248,0.2)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[var(--neu-danger)] focus:border-[var(--neu-danger)] focus:shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light),0_0_0_3px_rgba(248,113,113,0.2)]",
              icon && "pl-10",
              className
            )}
            {...props}
          />
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

NeuInput.displayName = "NeuInput";

export { NeuInput, type NeuInputProps };
