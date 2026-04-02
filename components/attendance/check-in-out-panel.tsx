"use client";

import * as React from "react";
import { Clock, LogIn, LogOut, CheckCircle } from "lucide-react";
import { ChipLoader } from "@/components/ui/chip-loader";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";

interface TodayRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: "present" | "absent" | "late";
  hoursWorked: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CheckInOutPanel() {
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [todayRecord, setTodayRecord] = React.useState<TodayRecord | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    fetchTodayRecord();
  }, []);

  const fetchTodayRecord = async () => {
    try {
      const today = new Date();
      const month = today.toISOString().slice(0, 7);
      const response = await fetch(`/api/attendance?month=${month}`);
      const data = await response.json();

      if (data.success && data.data?.records) {
        const todayStr = today.toISOString().split("T")[0];
        const todayRec = data.data.records.find(
          (r: TodayRecord) => r.date === todayStr
        );
        setTodayRecord(todayRec || null);
      }
    } catch (error) {
      console.error("Error fetching today's record:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        await fetchTodayRecord();
      } else {
        alert(data.error || "Failed to check in");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        await fetchTodayRecord();
      } else {
        alert(data.error || "Failed to check out");
      }
    } catch (error) {
      console.error("Check-out error:", error);
      alert("Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = todayRecord !== null;
  const isCheckedOut = todayRecord?.checkOut !== null;
  const isCompleted = isCheckedIn && isCheckedOut;

  const getStatusInfo = () => {
    if (!isCheckedIn) {
      return {
        text: "Not Checked In",
        color: "text-[var(--neu-text-muted)]",
      };
    }
    if (!isCheckedOut) {
      return {
        text: `Checked In at ${formatShortTime(todayRecord.checkIn)}`,
        color: "text-[var(--neu-success)]",
      };
    }
    return {
      text: `Checked Out — ${todayRecord.hoursWorked.toFixed(1)}h worked`,
      color: "text-[var(--neu-accent)]",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <NeuCard className="w-full">
      <NeuCardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Live Clock */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-[var(--neu-accent)]" />
              <span className="text-5xl font-bold text-[var(--neu-text)] tracking-tight" suppressHydrationWarning>
                {currentTime ? formatTime(currentTime) : "--:--:-- --"}
              </span>
            </div>
            <p className="text-lg text-[var(--neu-text-secondary)]" suppressHydrationWarning>
              {currentTime ? formatDate(currentTime) : "Loading..."}
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <span className={`text-lg font-medium ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {isCheckedIn && (
              <NeuBadge variant={todayRecord.status}>
                {todayRecord.status.charAt(0).toUpperCase() +
                  todayRecord.status.slice(1)}
              </NeuBadge>
            )}
          </div>

          {/* Action Button */}
          {initialLoading ? (
            <div className="w-full">
              <ChipLoader size="sm" />
            </div>
          ) : isCompleted ? (
            <NeuButton
              size="lg"
              disabled
              className="w-48 h-14 text-lg opacity-60"
            >
              <CheckCircle className="w-5 h-5" />
              Completed for today
            </NeuButton>
          ) : !isCheckedIn ? (
            <NeuButton
              variant="accent"
              size="lg"
              loading={loading}
              onClick={handleCheckIn}
              className="w-48 h-14 text-lg bg-[var(--neu-success)] hover:brightness-110"
            >
              <LogIn className="w-5 h-5" />
              Check In
            </NeuButton>
          ) : (
            <NeuButton
              size="lg"
              loading={loading}
              onClick={handleCheckOut}
              className="w-48 h-14 text-lg bg-[var(--neu-warning)] text-[var(--neu-bg)] hover:brightness-110"
            >
              <LogOut className="w-5 h-5" />
              Check Out
            </NeuButton>
          )}
        </div>
      </NeuCardContent>
    </NeuCard>
  );
}
