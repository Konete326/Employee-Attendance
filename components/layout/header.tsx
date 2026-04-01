"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./notification-bell";

interface UserData {
  name: string;
  email: string;
  role: string;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Fetch current user data
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Use window.location.href for a full page refresh to clear all React states and caches
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "admin" || path === "employee") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="h-16 bg-[var(--neu-surface)]/90 backdrop-blur-md border-b border-[var(--neu-border)] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-[var(--neu-text)] capitalize lg:ml-0 ml-12">
        {getPageTitle()}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--neu-accent)] flex items-center justify-center text-white font-medium text-sm">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[var(--neu-text)]">
              {user?.name || "Loading..."}
            </p>
            <p className="text-xs text-[var(--neu-text-secondary)] capitalize">
              {user?.role || ""}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-[var(--neu-surface-light)] text-[var(--neu-text-secondary)] hover:text-[var(--neu-danger)] transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
