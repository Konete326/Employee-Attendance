"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { DollarSign, Download } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
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
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <NeuButton onClick={handleGenerate} loading={generating} variant="accent">
            <DollarSign className="w-4 h-4 mr-2" />
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--neu-border)]">
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Employee</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Basic Salary</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Present Days</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Deductions</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Bonuses</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Net Salary</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((record) => (
                    <tr key={record._id} className="border-b border-[var(--neu-border)] last:border-0">
                      <td className="py-4 px-4">
                        <p className="font-medium">{record.userId?.name}</p>
                        <p className="text-sm text-[var(--neu-text-secondary)]">{record.userId?.employeeId}</p>
                      </td>
                      <td className="py-4 px-4">${record.basicSalary.toLocaleString()}</td>
                      <td className="py-4 px-4">{record.presentDays}</td>
                      <td className="py-4 px-4 text-[var(--neu-danger)]">
                        -${(record.absentDeduction + record.lateDeduction).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-[var(--neu-success)]">+${record.bonuses.toLocaleString()}</td>
                      <td className="py-4 px-4 font-semibold">${record.netSalary.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "finalized"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {record.status === "draft" && (
                            <NeuButton size="sm" onClick={() => handleFinalize(record._id)}>
                              Finalize
                            </NeuButton>
                          )}
                          <NeuButton
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadPayslip(record.userId?._id || "")}
                          >
                            <Download className="w-4 h-4" />
                          </NeuButton>
                        </div>
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
