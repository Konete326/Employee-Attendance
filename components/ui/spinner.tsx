"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-block rounded-full border-solid border-[var(--neu-border)] border-t-[var(--neu-accent)] animate-spin",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";
