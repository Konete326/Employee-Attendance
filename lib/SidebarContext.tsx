"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isAdminCollapsed: boolean;
  setIsAdminCollapsed: (collapsed: boolean) => void;
  isEmployeeCollapsed: boolean;
  setIsEmployeeCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isAdminCollapsed, setIsAdminCollapsed] = useState(false);
  const [isEmployeeCollapsed, setIsEmployeeCollapsed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const admin = localStorage.getItem("adminSidebarCollapsed") === "true";
    const employee = localStorage.getItem("employeeSidebarCollapsed") === "true";
    setIsAdminCollapsed(admin);
    setIsEmployeeCollapsed(employee);
  }, []);

  const setAdmin = (val: boolean) => {
    setIsAdminCollapsed(val);
    localStorage.setItem("adminSidebarCollapsed", String(val));
  };

  const setEmployee = (val: boolean) => {
    setIsEmployeeCollapsed(val);
    localStorage.setItem("employeeSidebarCollapsed", String(val));
  };

  return (
    <SidebarContext.Provider
      value={{
        isAdminCollapsed,
        setIsAdminCollapsed: setAdmin,
        isEmployeeCollapsed,
        setIsEmployeeCollapsed: setEmployee,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
