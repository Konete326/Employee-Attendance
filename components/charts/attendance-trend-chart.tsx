"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceTrendChartProps {
  data: {
    month: string;
    present: number;
    absent: number;
    late: number;
  }[];
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-border)" />
        <XAxis
          dataKey="month"
          tick={{ fill: "var(--neu-text-secondary)", fontSize: 12 }}
          axisLine={{ stroke: "var(--neu-border)" }}
        />
        <YAxis
          tick={{ fill: "var(--neu-text-secondary)", fontSize: 12 }}
          axisLine={{ stroke: "var(--neu-border)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--neu-surface)",
            border: "1px solid var(--neu-border)",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="present"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e" }}
          name="Present"
        />
        <Line
          type="monotone"
          dataKey="absent"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: "#ef4444" }}
          name="Absent"
        />
        <Line
          type="monotone"
          dataKey="late"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: "#f59e0b" }}
          name="Late"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
