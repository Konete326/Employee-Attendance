"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center p-8",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mb-4">
            <Icon className="w-12 h-12 text-[var(--neu-text-muted)] opacity-50" />
          </div>
        )}
        <h3 className="text-lg font-medium text-[var(--neu-text)] mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--neu-text-secondary)] mb-4">
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 px-4 py-2 text-sm font-medium text-[var(--neu-accent)] hover:text-[var(--neu-accent-hover)] transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
