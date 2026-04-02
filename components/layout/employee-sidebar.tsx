"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarPlus,
  FileText,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/lib/SidebarContext";

const navItems = [
  { name: "My Dashboard", href: "/employee", icon: LayoutDashboard },
  { name: "My Attendance", href: "/employee/attendance", icon: ClipboardCheck },
  { name: "Apply Leave", href: "/employee/leaves", icon: CalendarPlus },
  { name: "My Payslip", href: "/employee/payslip", icon: FileText },
  { name: "Notifications", href: "/employee/notifications", icon: Bell },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isEmployeeCollapsed: isCollapsed, setIsEmployeeCollapsed: setIsCollapsed } = useSidebar();

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
        <div className="h-20 flex items-center justify-center border-b border-[var(--neu-border)] p-4">
          <Link href="/employee" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="AttendEase Logo" 
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "w-10 h-10 object-contain" : "h-12 w-auto object-contain"
              )} 
            />
          </Link>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden lg:flex absolute right-2 top-4 w-8 h-8 bg-[var(--neu-surface)] rounded-lg items-center justify-center text-[var(--neu-text-secondary)] shadow-sm z-50 hover:bg-[var(--neu-accent)] hover:text-white transition-all",
            "border border-white/5",
            isCollapsed && "right-[-40px] bg-[var(--neu-accent)] text-white"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
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
