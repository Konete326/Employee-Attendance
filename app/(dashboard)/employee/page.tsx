"use client";

import * as React from "react";
import { CalendarDays, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { NeuStatCard } from "@/components/ui/neu-stat-card";
import { NeuTable, NeuTableHeader, NeuTableBody, NeuTableRow, NeuTableHead, NeuTableCell } from "@/components/ui/neu-table";
import { NeuBadge } from "@/components/ui/neu-badge";
import { NeuButton } from "@/components/ui/neu-button";
import CheckInOutPanel from "@/components/attendance/check-in-out-panel";
import { ChipLoader } from "@/components/ui/chip-loader";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: "present" | "absent" | "late";
  hoursWorked: number;
}

function formatShortTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getCurrentMonth(): string {
  const now = new Date();
  return now.toISOString().slice(0, 7);
}

function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 2);
  return date.toISOString().slice(0, 7);
}

function getNextMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum);
  return date.toISOString().slice(0, 7);
}

function getWorkingDaysInMonth(month: string): number {
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthNum - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
}

export default function EmployeeDashboard() {
  const [user, setUser] = React.useState<User | null>(null);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [currentMonth, setCurrentMonth] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setCurrentMonth(getCurrentMonth());
    fetchUserData();
  }, []);

  React.useEffect(() => {
    if (currentMonth) {
      fetchAttendanceData();
    }
  }, [currentMonth]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance?month=${currentMonth}`);
      const data = await response.json();
      if (data.success) {
        setRecords(Array.isArray(data.data.records) ? data.data.records : []);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const workingDays = currentMonth ? getWorkingDaysInMonth(currentMonth) : 0;
  const daysPresent = records.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const attendancePercentage = workingDays > 0 
    ? Math.round((daysPresent / workingDays) * 100) 
    : 0;

  const handlePreviousMonth = () => {
    if (currentMonth) {
      setCurrentMonth(getPreviousMonth(currentMonth));
    }
  };

  const handleNextMonth = () => {
    if (currentMonth) {
      setCurrentMonth(getNextMonth(currentMonth));
    }
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--neu-text)]">
          Welcome back{user ? `, ${user.name.split(" ")[0]}!` : "!"}
        </h1>
        <p className="text-[var(--neu-text-secondary)]">
          {user?.department && `${user.department} • `}
          {currentMonth ? `${getMonthName(currentMonth)} Overview` : "Loading..."}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeuStatCard
          title="This Month"
          value={`${daysPresent} days`}
          subtitle={`of ${workingDays} working days`}
          icon={<CalendarDays className="w-6 h-6" />}
        />
        <NeuStatCard
          title="Hours Worked"
          value={`${totalHours.toFixed(1)}h`}
          subtitle="total this month"
          icon={<Clock className="w-6 h-6" />}
        />
        <NeuStatCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          trend={attendancePercentage >= 90 ? "up" : attendancePercentage >= 70 ? "neutral" : "down"}
          trendValue={attendancePercentage >= 90 ? "Great!" : attendancePercentage >= 70 ? "Good" : "Needs improvement"}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Check-in/out Panel */}
      <CheckInOutPanel />

      {/* Recent Attendance History */}
      <NeuCard>
        <NeuCardHeader>
          <div className="flex items-center justify-between">
            <NeuCardTitle>Recent Attendance</NeuCardTitle>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[var(--neu-text-secondary)]">Month:</label>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--neu-border)] bg-[var(--neu-bg)] text-sm font-medium text-[var(--neu-text)] focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)]/20 transition-all"
              />
            </div>
          </div>
        </NeuCardHeader>
        <NeuCardContent>
          {loading ? (
            <ChipLoader size="sm" />
          ) : records.length === 0 ? (
            <p className="text-center text-[var(--neu-text-muted)] py-8">
              No attendance records for this month
            </p>
          ) : (
            <NeuTable>
              <NeuTableHeader>
                <NeuTableRow>
                  <NeuTableHead>Date</NeuTableHead>
                  <NeuTableHead>Check In</NeuTableHead>
                  <NeuTableHead>Check Out</NeuTableHead>
                  <NeuTableHead>Hours</NeuTableHead>
                  <NeuTableHead>Status</NeuTableHead>
                </NeuTableRow>
              </NeuTableHeader>
              <NeuTableBody>
                {records.slice(0, 30).map((record) => (
                  <NeuTableRow key={record._id}>
                    <NeuTableCell className="font-medium text-[var(--neu-text)]">
                      {formatDisplayDate(record.date)}
                    </NeuTableCell>
                    <NeuTableCell>
                      {record.checkIn ? formatShortTime(record.checkIn) : "-"}
                    </NeuTableCell>
                    <NeuTableCell>
                      {record.checkOut ? formatShortTime(record.checkOut) : "-"}
                    </NeuTableCell>
                    <NeuTableCell>
                      {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : "-"}
                    </NeuTableCell>
                    <NeuTableCell>
                      <NeuBadge variant={record.status}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </NeuBadge>
                    </NeuTableCell>
                  </NeuTableRow>
                ))}
              </NeuTableBody>
            </NeuTable>
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
