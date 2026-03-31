"use client";

import { Download } from "lucide-react";
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

export function AttendanceExport({ records, month }: AttendanceExportProps) {
  const handleExport = () => {
    if (records.length === 0) {
      return;
    }

    const csvContent = generateCSV(records);
    const fileMonth = month || new Date().toISOString().slice(0, 7);
    const filename = `attendance-${fileMonth}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  return (
    <NeuButton
      variant="default"
      size="sm"
      onClick={handleExport}
      disabled={records.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </NeuButton>
  );
}
