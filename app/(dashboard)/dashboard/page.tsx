"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (data.data?.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/employee");
        }
      } catch {
        router.replace("/login");
      }
    };
    checkRole();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--neu-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: "var(--neu-text-secondary)" }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
