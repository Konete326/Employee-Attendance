"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Clock, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuAvatar } from "@/components/ui/neu-avatar";
import type { UserRole } from "@/types";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: ["admin"],
  },
  {
    label: "Employees",
    href: "/admin/employees",
    icon: <Users className="w-4 h-4" />,
    roles: ["admin"],
  },
  {
    label: "My Attendance",
    href: "/employee",
    icon: <Clock className="w-4 h-4" />,
    roles: ["employee"],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Fetch current user on mount
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          // Not authenticated, redirect to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActiveLink = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 h-16 z-40",
          "backdrop-blur-xl bg-[var(--neu-surface)]/80",
          "border-b border-[var(--neu-border)]"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-center">
          <div className="animate-pulse text-[var(--neu-text-muted)]">Loading...</div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 h-16 z-40",
        "backdrop-blur-xl bg-[var(--neu-surface)]/80",
        "border-b border-[var(--neu-border)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href={user.role === "admin" ? "/dashboard" : "/employee"}
          className="flex items-center gap-2 text-[var(--neu-text)] hover:text-[var(--neu-accent)] transition-colors"
        >
          <Clock className="w-6 h-6 text-[var(--neu-accent)]" />
          <span className="font-semibold text-lg">AttendEase</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-[var(--neu-radius)]",
                "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text)]",
                "hover:bg-[var(--neu-surface-light)] transition-all duration-200",
                isActiveLink(item.href) && "text-[var(--neu-accent)] bg-[var(--neu-surface-light)]"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Section - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <NeuAvatar name={user.name} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--neu-text)]">
                {user.name}
              </span>
              <span className="text-xs text-[var(--neu-text-muted)] capitalize">
                {user.role}
              </span>
            </div>
          </div>
          <NeuButton variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </NeuButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[var(--neu-text)] hover:text-[var(--neu-accent)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "md:hidden absolute top-16 left-0 right-0",
            "bg-[var(--neu-surface)] border-b border-[var(--neu-border)]",
            "shadow-[0_8px_16px_var(--neu-shadow-dark)]"
          )}
        >
          <div className="flex flex-col p-4 gap-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[var(--neu-radius)]",
                  "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text)]",
                  "hover:bg-[var(--neu-surface-light)] transition-all duration-200",
                  isActiveLink(item.href) && "text-[var(--neu-accent)] bg-[var(--neu-surface-light)]"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile User Section */}
            <div className="mt-4 pt-4 border-t border-[var(--neu-border)]">
              <div className="flex items-center gap-3 px-4 py-2">
                <NeuAvatar name={user.name} size="sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--neu-text)]">
                    {user.name}
                  </span>
                  <span className="text-xs text-[var(--neu-text-muted)] capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 mt-2",
                  "text-[var(--neu-text-secondary)] hover:text-[var(--neu-danger)]",
                  "hover:bg-[var(--neu-surface-light)] transition-all duration-200",
                  "rounded-[var(--neu-radius)]"
                )}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
