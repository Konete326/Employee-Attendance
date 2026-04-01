"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceBarChartProps {
  data: {
    date: string;
    present: number;
    absent: number;
    late?: number;
  }[];
}

export function AttendanceBarChart({ data }: AttendanceBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--neu-border)" />
        <XAxis
          dataKey="date"
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
        <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
        <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
        {data[0]?.late !== undefined && (
          <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
