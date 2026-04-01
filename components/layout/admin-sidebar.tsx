"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  BarChart2,
  ScrollText,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Employees", href: "/admin/employees", icon: Users },
  { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { name: "Leaves", href: "/admin/leaves", icon: Calendar },
  { name: "Payroll", href: "/admin/payroll", icon: DollarSign },
  { name: "Shifts", href: "/admin/shifts", icon: Clock },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Reports", href: "/admin/reports", icon: BarChart2 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--neu-surface)] rounded-lg shadow-[var(--neu-shadow)]"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-[var(--neu-bg)]/90 backdrop-blur-md border-r border-[var(--neu-border)] z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[var(--neu-border)]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--neu-accent)] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-[var(--neu-text)]">
                AttendEase
              </span>
            )}
          </Link>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[var(--neu-accent)] rounded-full items-center justify-center text-white text-xs"
        >
          {isCollapsed ? ">" : "<"}
        </button>

        {/* Nav items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                  isActive
                    ? "bg-[var(--neu-accent)] text-white shadow-[var(--neu-shadow)]"
                    : "text-[var(--neu-text-secondary)] hover:bg-[var(--neu-surface)] hover:text-[var(--neu-text)]"
                )}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
