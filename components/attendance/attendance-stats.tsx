"use client";

import { UserCheck, UserX, Clock, TrendingUp, Timer, Users } from "lucide-react";
import { NeuStatCard } from "@/components/ui/neu-stat-card";
import { ChipLoader } from "@/components/ui/chip-loader";

interface AttendanceStatsData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  avgHoursThisMonth: number;
  attendanceRate: number;
  totalLateThisMonth: number;
  presentTrend: number;
  lateTrend: number;
  month: string;
}

interface AttendanceStatsProps {
  stats: AttendanceStatsData | null;
  isLoading?: boolean;
}

export function AttendanceStats({ stats, isLoading }: AttendanceStatsProps) {
  if (isLoading || !stats) {
    return <ChipLoader size="md" />;
  }

  const getTrend = (value: number): "up" | "down" | "neutral" => {
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "neutral";
  };

  const formatTrendValue = (value: number): string => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}%`;
  };

  return (
    <div className="space-y-4">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeuStatCard
          title="Present Today"
          value={stats.presentToday}
          icon={<UserCheck className="w-6 h-6" />}
          trend={getTrend(stats.presentTrend)}
          trendValue={stats.presentTrend !== 0 ? formatTrendValue(stats.presentTrend) : undefined}
          subtitle="vs yesterday"
        />
        <NeuStatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={<UserX className="w-6 h-6" />}
          trend="down"
          subtitle="employees"
        />
        <NeuStatCard
          title="Late Today"
          value={stats.lateToday}
          icon={<Clock className="w-6 h-6" />}
          trend={getTrend(stats.lateTrend)}
          trendValue={stats.lateTrend !== 0 ? formatTrendValue(stats.lateTrend) : undefined}
          subtitle="vs yesterday"
        />
        <NeuStatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={stats.attendanceRate >= 90 ? "up" : stats.attendanceRate >= 75 ? "neutral" : "down"}
          subtitle="this month"
        />
      </div>

      {/* Second Row - 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NeuStatCard
          title="Avg Hours/Day"
          value={`${stats.avgHoursThisMonth}h`}
          icon={<Timer className="w-6 h-6" />}
          subtitle="this month"
        />
        <NeuStatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-6 h-6" />}
          subtitle="active"
        />
      </div>
    </div>
  );
}
