"use client";

import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    MapPin,
    DollarSign,
    Users,
    Shield,
    BarChart3,
    LayoutDashboard,
    LogIn,
    FileText,
    Bell,
    Activity,
} from "lucide-react";
import React from "react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items: BentoItem[];
    className?: string;
}

function BentoGrid({ items, className }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto", className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative p-5 rounded-2xl overflow-hidden transition-all duration-300",
                        "bg-[var(--neu-surface)]",
                        "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
                        "hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]",
                        "hover:-translate-y-1 will-change-transform",
                        item.colSpan || "col-span-1",
                        item.colSpan === 2 ? "md:col-span-2" : "",
                        {
                            "shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px-12px_var(--neu-shadow-light)] -translate-y-1":
                                item.hasPersistentHover,
                        }
                    )}
                >
                    {/* Background gradient effect */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-300 rounded-2xl",
                            item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--neu-accent)]/5 to-purple-500/5 rounded-2xl" />
                    </div>

                    <div className="relative flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                "bg-[var(--neu-bg)] shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]",
                                "group-hover:bg-gradient-to-br group-hover:from-[var(--neu-accent)]/20 group-hover:to-purple-500/20"
                            )}>
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-3 py-1 rounded-full",
                                        "bg-[var(--neu-bg)] shadow-[inset_1px_1px_2px_var(--neu-shadow-dark),inset_-1px_-1px-2px_var(--neu-shadow-light)]",
                                        "text-[var(--neu-text-secondary)]"
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-[var(--neu-text)] tracking-tight text-base">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-[var(--neu-text-secondary)] font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-[var(--neu-text-secondary)] leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className="flex items-center flex-wrap gap-2 mt-2">
                                {item.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            "px-2 py-1 rounded-md text-xs",
                                            "bg-[var(--neu-bg)] text-[var(--neu-accent)]",
                                            "shadow-[inset_1px_1px_2px_var(--neu-shadow-dark),inset_-1px_-1px-2px_var(--neu-shadow-light)]"
                                        )}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {item.cta && (
                            <span className={cn(
                                "text-xs text-[var(--neu-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-auto pt-2"
                            )}>
                                {item.cta}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Pre-configured BentoGrid items for AttendEase
export const attendEaseBentoItems: BentoItem[] = [
    {
        title: "GPS Check-In",
        meta: "Live",
        description: "Location-based attendance tracking with real-time GPS verification and geofencing support",
        icon: <MapPin className="w-5 h-5 text-[var(--neu-accent)]" />,
        status: "Active",
        tags: ["GPS", "Real-time", "Geofencing"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "Payroll Engine",
        meta: "Auto-calc",
        description: "Automated salary calculations based on attendance data",
        icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
        status: "Ready",
        tags: ["Payroll", "Auto"],
    },
    {
        title: "Manage Leaves",
        meta: "Smart",
        description: "Intelligent leave management with approval workflows and balance tracking",
        icon: <Clock className="w-5 h-5 text-purple-400" />,
        status: "Live",
        tags: ["Leaves", "Workflow"],
    },
    {
        title: "Role Access",
        meta: "Secure",
        description: "Granular permissions with Admin & Employee JWT-protected roles",
        icon: <Shield className="w-5 h-5 text-amber-400" />,
        status: "Secure",
        tags: ["RBAC", "JWT", "Auth"],
        colSpan: 1,
    },
    {
        title: "HR Platform",
        meta: "Unified",
        description: "Complete HR suite with employee profiles, departments, and org chart",
        icon: <Users className="w-5 h-5 text-sky-400" />,
        tags: ["HR", "Profiles"],
    },
    {
        title: "Track Hours",
        meta: "Accurate",
        description: "Precise time tracking with overtime calculations and break deductions",
        icon: <Activity className="w-5 h-5 text-rose-400" />,
        status: "Live",
        tags: ["Time", "OT"],
    },
    {
        title: "Admin Panel",
        meta: "Full Control",
        description: "Comprehensive dashboard with reports, analytics, and system management",
        icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" />,
        tags: ["Dashboard", "Reports"],
        colSpan: 2,
    },
];

// Stats Bento Items
export const statsBentoItems: BentoItem[] = [
    {
        title: "API Routes",
        meta: "30+",
        description: "Fully typed Next.js route handlers with comprehensive endpoints",
        icon: <FileText className="w-5 h-5 text-[var(--neu-accent)]" />,
        status: "REST",
        tags: ["Next.js", "TypeScript"],
    },
    {
        title: "User Roles",
        meta: "2",
        description: "Admin & Employee with JWT guards and role-based access control",
        icon: <Shield className="w-5 h-5 text-purple-400" />,
        status: "RBAC",
        tags: ["JWT", "Auth"],
    },
    {
        title: "Core Modules",
        meta: "6",
        description: "Attendance · Leave · Payroll · Reports · Audit · Notifications",
        icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
        status: "Complete",
        tags: ["Modular", "Scalable"],
    },
];

// Quick Actions Bento Items (replacing the 3 feature cards)
export const quickActionsBentoItems: BentoItem[] = [
    {
        title: "Quick Check-in",
        meta: "One-click",
        description: "Instant check-in and check-out with automatic time tracking and location capture",
        icon: <LogIn className="w-5 h-5 text-[var(--neu-accent)]" />,
        status: "Live",
        tags: ["Fast", "Auto"],
        cta: "Try now →",
        hasPersistentHover: true,
    },
    {
        title: "Admin Dashboard",
        meta: "Overview",
        description: "Comprehensive view of attendance, reports, and employee management in one place",
        icon: <LayoutDashboard className="w-5 h-5 text-purple-400" />,
        status: "Updated",
        tags: ["Analytics", "Manage"],
        cta: "Explore →",
    },
    {
        title: "Detailed Reports",
        meta: "Export",
        description: "Weekly and monthly reports with attendance stats, PDF export, and insights",
        icon: <FileText className="w-5 h-5 text-emerald-400" />,
        status: "Ready",
        tags: ["PDF", "Stats"],
        cta: "View →",
    },
];

export { BentoGrid };
