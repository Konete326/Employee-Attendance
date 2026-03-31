"use client";

import { cn } from "@/lib/utils";

export default function Footer() {
  return (
    <footer
      className={cn(
        "py-4 px-4 md:px-8",
        "backdrop-blur-xl bg-[var(--neu-surface)]/80",
        "border-t border-[var(--neu-border)]"
      )}
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-[var(--neu-text-muted)]">
          © 2026 AttendEase — Employee Attendance System
        </p>
      </div>
    </footer>
  );
}
