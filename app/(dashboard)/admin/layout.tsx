"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";
import { useSidebar } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdminCollapsed: isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-transparent relative z-10">
      <AdminSidebar />
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
