"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NeuDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const NeuDialog: React.FC<NeuDialogProps> = ({
  open,
  onClose,
  title,
  children,
  className,
}) => {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md",
          "bg-[var(--neu-surface)]",
          "border border-[var(--neu-border)]",
          "rounded-[var(--neu-radius)]",
          "shadow-[12px_12px_24px_var(--neu-shadow-dark),-12px_-12px_24px_var(--neu-shadow-light)]",
          "animate-in zoom-in-95 fade-in duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--neu-border)]">
          {title && (
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-[var(--neu-text)]"
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className={cn(
              "ml-auto p-1.5 rounded-lg",
              "text-[var(--neu-text-muted)]",
              "hover:text-[var(--neu-text)] hover:bg-[var(--neu-surface-light)]",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)]"
            )}
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export { NeuDialog, type NeuDialogProps };
