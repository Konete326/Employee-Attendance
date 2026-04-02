"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { EmptyState } from "@/components/ui/empty-state";
import { DollarSign, Download, User as UserIcon, TrendingUp, TrendingDown } from "lucide-react";
import { ChipLoader } from "@/components/ui/chip-loader";
import { List2, ListItem } from "@/components/ui/list-2";
import { NeuBadge } from "@/components/ui/neu-badge";

interface PayrollRecord {
  _id: string;
  userId: { _id: string; name: string; employeeId?: string };
  month: number;
  year: number;
  basicSalary: number;
  presentDays: number;
  absentDeduction: number;
  lateDeduction: number;
  bonuses: number;
  netSalary: number;
  status: "draft" | "finalized";
}

export default function AdminPayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payroll?month=${month}&year=${year}`);
      const data = await response.json();
      if (data.success) {
        setPayroll(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payroll", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month, year]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      if (response.ok) {
        fetchPayroll();
      }
    } catch (error) {
      console.error("Failed to generate payroll", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalize = async (id: string) => {
    try {
      const response = await fetch(`/api/payroll/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        fetchPayroll();
      }
    } catch (error) {
      console.error("Failed to finalize payroll", error);
    }
  };

  const downloadPayslip = (userId: string) => {
    window.open(`/api/export/payslip/${userId}?month=${month}&year=${year}`, "_blank");
  };

  // We use the overlay mode in the return block instead of an early return 
  // to avoid layout shifts and maintain a professional appearance while loading.

  return (
    <div className="relative space-y-6" style={{ minHeight: "400px" }}>
      {/* Overlay loader — blurs behind without shifting layout */}
      {loading && (
        <ChipLoader overlay size="md" label="Loading" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)] text-sm outline-none transition-colors hover:border-[var(--neu-accent)]/50 focus:border-[var(--neu-accent)]"
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
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)] text-sm outline-none transition-colors hover:border-[var(--neu-accent)]/50 focus:border-[var(--neu-accent)]"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <NeuButton onClick={handleGenerate} loading={generating} variant="accent" className="w-full sm:w-auto">
            <DollarSign className="w-4 h-4" />
            Generate Payroll
          </NeuButton>
        </div>
      </div>

      {/* Payroll Table */}
      <NeuCard>
        <NeuCardContent className="p-6">
          {payroll.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No payroll records"
              description={`No payroll generated for ${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })} ${year}. Click Generate Payroll to create.`}
            />
          ) : (
            <List2 
              items={payroll.map((record) => ({
                icon: <UserIcon className="w-5 h-5 text-[var(--neu-accent)]" />,
                title: record.userId?.name || "Unknown Employee",
                category: record.userId?.employeeId || "NO ID",
                description: (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="opacity-70">Basic: ${record.basicSalary.toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-[var(--neu-danger)]">
                        <TrendingDown className="w-3 h-3" />
                        -${(record.absentDeduction + record.lateDeduction).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-[var(--neu-success)]">
                        <TrendingUp className="w-3 h-3" />
                        +${record.bonuses.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xl font-black text-[var(--neu-text)]">
                      Net: <span className="text-[var(--neu-accent)]">${record.netSalary.toLocaleString()}</span>
                      <span className="text-xs font-normal opacity-50 ml-2">({record.presentDays} Days)</span>
                    </div>
                  </div>
                ),
                status: (
                  <div className="flex items-center gap-2">
                    <NeuBadge variant={record.status === "finalized" ? "success" : "warning"}>
                      {record.status.toUpperCase()}
                    </NeuBadge>
                    <div className="flex gap-1 ml-2">
                      {record.status === "draft" && (
                        <NeuButton
                          size="icon"
                          variant="ghost"
                          onClick={() => handleFinalize(record._id)}
                          className="h-8 w-8 text-[var(--neu-accent)] hover:bg-[var(--neu-accent)]/10"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </NeuButton>
                      )}
                      <NeuButton
                        size="icon"
                        variant="ghost"
                        onClick={() => downloadPayslip(record.userId?._id || "")}
                        className="h-8 w-8 opacity-70 hover:opacity-100"
                      >
                        <Download className="w-4 h-4" />
                      </NeuButton>
                    </div>
                  </div>
                )
              }))}
            />
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
