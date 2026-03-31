"use client";

import { NeuTable, NeuTableHeader, NeuTableBody, NeuTableRow, NeuTableHead, NeuTableCell } from "@/components/ui/neu-table";
import { NeuBadge } from "@/components/ui/neu-badge";

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

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "—";
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

function getUserName(userId: UserData | string): string {
  if (typeof userId === "object" && userId !== null) {
    return userId.name;
  }
  return "Unknown";
}

function getUserDepartment(userId: UserData | string): string {
  if (typeof userId === "object" && userId !== null) {
    return userId.department || "—";
  }
  return "—";
}

function getStatusBadgeVariant(status: string): "present" | "absent" | "late" | "default" {
  switch (status) {
    case "present":
      return "present";
    case "absent":
      return "absent";
    case "late":
      return "late";
    default:
      return "default";
  }
}

function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined || hours === 0) return "—";
  return `${hours.toFixed(1)}h`;
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--neu-text-secondary)]">
        <p className="text-lg font-medium">No attendance records found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <NeuTable>
        <NeuTableHeader>
          <NeuTableRow>
            <NeuTableHead>Employee Name</NeuTableHead>
            <NeuTableHead>Department</NeuTableHead>
            <NeuTableHead>Date</NeuTableHead>
            <NeuTableHead>Check In</NeuTableHead>
            <NeuTableHead>Check Out</NeuTableHead>
            <NeuTableHead>Hours Worked</NeuTableHead>
            <NeuTableHead>Status</NeuTableHead>
          </NeuTableRow>
        </NeuTableHeader>
        <NeuTableBody>
          {records.map((record) => (
            <NeuTableRow key={record._id}>
              <NeuTableCell className="font-medium text-[var(--neu-text)]">
                {getUserName(record.userId)}
              </NeuTableCell>
              <NeuTableCell>{getUserDepartment(record.userId)}</NeuTableCell>
              <NeuTableCell>{formatDate(record.date)}</NeuTableCell>
              <NeuTableCell>{formatTime(record.checkIn)}</NeuTableCell>
              <NeuTableCell>{formatTime(record.checkOut)}</NeuTableCell>
              <NeuTableCell>{formatHours(record.hoursWorked)}</NeuTableCell>
              <NeuTableCell>
                <NeuBadge variant={getStatusBadgeVariant(record.status)}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </NeuBadge>
              </NeuTableCell>
            </NeuTableRow>
          ))}
        </NeuTableBody>
      </NeuTable>
    </div>
  );
}
