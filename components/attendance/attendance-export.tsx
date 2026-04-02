"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { NeuButton } from "@/components/ui/neu-button";

interface UserData {
  _id: string;
  name: string;
  email: string;
  department?: string;
}

interface AttendanceRecord {
  _id: string;
  userId: UserData | string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  hoursWorked: number;
  status: "present" | "absent" | "late";
  notes?: string;
}

interface AttendanceExportProps {
  records: AttendanceRecord[];
  month?: string;
  year?: string;
  dept?: string;
}

function getUserName(userId: UserData | string): string {
  if (typeof userId === "object" && userId !== null) {
    return userId.name;
  }
  return "Unknown";
}

function getUserEmail(userId: UserData | string): string {
  if (typeof userId === "object" && userId !== null) {
    return userId.email;
  }
  return "—";
}

function getUserDepartment(userId: UserData | string): string {
  if (typeof userId === "object" && userId !== null) {
    return userId.department || "—";
  }
  return "—";
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined || hours === 0) return "";
  return hours.toFixed(1);
}

function generateCSV(records: AttendanceRecord[]): string {
  const headers = ["Name", "Email", "Department", "Date", "Check In", "Check Out", "Hours", "Status"];
  
  const rows = records.map((record) => [
    getUserName(record.userId),
    getUserEmail(record.userId),
    getUserDepartment(record.userId),
    formatDate(record.date),
    formatTime(record.checkIn),
    formatTime(record.checkOut),
    formatHours(record.hoursWorked),
    record.status.charAt(0).toUpperCase() + record.status.slice(1),
  ]);

  // Escape values and create CSV content
  const escapeValue = (value: string): string => {
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeValue).join(",")),
  ].join("\n");

  return csvContent;
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function AttendanceExport({ records, month, year, dept }: AttendanceExportProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Get current month/year if not provided
  const currentDate = new Date();
  const exportMonth = month || String(currentDate.getMonth() + 1);
  const exportYear = year || String(currentDate.getFullYear());

  const handleExportCSV = () => {
    if (records.length === 0) {
      return;
    }

    const csvContent = generateCSV(records);
    const fileMonth = exportMonth.padStart(2, "0");
    const filename = `attendance-${exportYear}-${fileMonth}.csv`;

    downloadCSV(csvContent, filename);
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const params = new URLSearchParams();
      params.append("format", "excel");
      params.append("month", exportMonth);
      params.append("year", exportYear);
      if (dept) params.append("dept", dept);

      const response = await fetch(`/api/export/attendance?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or generate default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `attendance-${exportYear}-${exportMonth}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Excel error:", error);
      alert("Failed to export Excel. Please try again.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const params = new URLSearchParams();
      params.append("format", "pdf");
      params.append("month", exportMonth);
      params.append("year", exportYear);
      if (dept) params.append("dept", dept);

      const response = await fetch(`/api/export/attendance?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or generate default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `attendance-${exportYear}-${exportMonth}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <NeuButton
        variant="ghost"
        size="sm"
        onClick={handleExportCSV}
        disabled={records.length === 0}
        className="flex-1 sm:flex-none h-9"
      >
        <Download className="w-4 h-4" />
        CSV
      </NeuButton>

      <NeuButton
        variant="ghost"
        size="sm"
        onClick={handleExportExcel}
        disabled={isExportingExcel || records.length === 0}
        className="flex-1 sm:flex-none h-9"
      >
        {isExportingExcel ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        Excel
      </NeuButton>

      <NeuButton
        variant="accent"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExportingPDF || records.length === 0}
        className="flex-1 sm:flex-none h-9 shadow-[0_0_15px_-5px_var(--neu-accent)]"
      >
        {isExportingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        PDF
      </NeuButton>
    </div>
  );
}
