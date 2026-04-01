"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-700";
      case "late": return "bg-yellow-100 text-yellow-700";
      case "absent": return "bg-red-100 text-red-700";
      case "half-day": return "bg-purple-100 text-purple-700";
      case "on-leave": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--neu-border)]">
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Check-in</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Check-out</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Working Hours</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-[var(--neu-border)] last:border-0">
                      <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-"}
                      </td>
                      <td className="py-3 px-4">{record.hoursWorked?.toFixed(1) || "0.0"} hrs</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
