"use client";

import { EmployeeSidebar } from "@/components/layout/employee-sidebar";
import { Header } from "@/components/layout/header";
import { useSidebar } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEmployeeCollapsed: isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-transparent relative z-10">
      <EmployeeSidebar />
      <div 
        className={cn(
          "flex-1 transition-all duration-300 min-w-0",
          "ml-0",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Header />
        <main className="p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
