"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck, Calendar, Clock } from "lucide-react";
import { List2, ListItem } from "@/components/ui/list-2";
import { NeuBadge } from "@/components/ui/neu-badge";

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  hoursWorked: number;
}

export default function EmployeeAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance?month=${year}-${String(month).padStart(2, "0")}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records || []);
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "present": return "present" as const;
      case "late": return "late" as const;
      case "absent": return "absent" as const;
      case "half-day": return "warning" as const;
      case "on-leave": return "accent" as const;
      default: return "default" as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Attendance</h2>
        <div className="flex items-center gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)]"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)]"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <NeuCard>
        <NeuCardContent className="p-6">
          {records.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No attendance records"
              description="No attendance records found for this month."
            />
          ) : (
            <List2 
              items={records.map((record) => ({
                icon: <Calendar className="w-5 h-5 text-[var(--neu-accent)]" />,
                title: new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                category: "LOGGED ATTENDANCE",
                description: (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 opacity-70">
                        <Clock className="w-3.5 h-3.5" />
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1 opacity-70">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                      </span>
                      <span className="ml-2 font-bold text-[var(--neu-accent)]">
                        {record.hoursWorked?.toFixed(1) || "0"}h
                      </span>
                    </div>
                  </div>
                ),
                status: (
                  <NeuBadge variant={getStatusBadgeVariant(record.status)}>
                    {record.status}
                  </NeuBadge>
                )
              }))}
            />
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
