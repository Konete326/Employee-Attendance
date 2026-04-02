"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Download } from "lucide-react";

interface PayrollRecord {
  _id: string;
  month: number;
  year: number;
  basicSalary: number;
  presentDays: number;
  absentDeduction: number;
  lateDeduction: number;
  unpaidLeaveDeduction: number;
  bonuses: number;
  netSalary: number;
  status: string;
}

export default function EmployeePayslipPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ _id: string; name: string; employeeId?: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    try {
      const [payrollRes, userRes] = await Promise.all([
        fetch(`/api/payroll/my?month=${month}&year=${year}`),
        fetch("/api/auth/me"),
      ]);

      const payrollData = await payrollRes.json();
      const userData = await userRes.json();

      if (payrollData.success) setPayroll(payrollData.data);
      if (userData.success) setUser(userData.data);
    } catch (error) {
      console.error("Failed to fetch payslip data", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = () => {
    if (user?._id) {
      window.open(`/api/export/payslip/${user._id}?month=${month}&year=${year}`, "_blank");
    }
  };

  const selectedPayroll = payroll[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">My Payslip</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)] text-sm"
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
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-[var(--neu-surface)] border border-[var(--neu-border)] text-sm"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedPayroll ? (
        <EmptyState
          icon={FileText}
          title="No payslip found"
          description={`No payslip available for ${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })} ${year}.`}
        />
      ) : (
        <NeuCard>
          <NeuCardContent className="p-8">
            {/* Header */}
            <div className="border-b border-[var(--neu-border)] pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-[var(--neu-accent)]">AttendEase</h3>
                <p className="text-sm text-[var(--neu-text-secondary)]">Employee Payslip</p>
              </div>
              <div className="sm:text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-[var(--neu-text-secondary)]">ID: {user?.employeeId || "N/A"}</p>
              </div>
            </div>
              <div className="mt-4">
                <p className="text-lg font-semibold">
                  {new Date(year, month - 1).toLocaleString("en-US", { month: "long" })} {year}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  selectedPayroll.status === "finalized" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedPayroll.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Salary Details */}
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-[var(--neu-border)]">
                <span className="text-[var(--neu-text-secondary)]">Basic Salary</span>
                <span className="font-medium">${selectedPayroll.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[var(--neu-border)]">
                <span className="text-[var(--neu-text-secondary)]">Present Days</span>
                <span className="font-medium">{selectedPayroll.presentDays}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[var(--neu-border)] text-red-600">
                <span>Absent Deduction</span>
                <span>-${selectedPayroll.absentDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[var(--neu-border)] text-red-600">
                <span>Late Deduction</span>
                <span>-${selectedPayroll.lateDeduction.toLocaleString()}</span>
              </div>
              {selectedPayroll.unpaidLeaveDeduction > 0 && (
                <div className="flex justify-between py-3 border-b border-[var(--neu-border)] text-red-600">
                  <span>Unpaid Leave Deduction</span>
                  <span>-${selectedPayroll.unpaidLeaveDeduction.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-[var(--neu-border)] text-green-600">
                <span>Bonuses</span>
                <span>+${selectedPayroll.bonuses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold">
                <span>Net Salary</span>
                <span className="text-[var(--neu-accent)]">${selectedPayroll.netSalary.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[var(--neu-border)]">
              <p className="text-xs text-[var(--neu-text-secondary)]">
                This is a computer-generated payslip and does not require a signature.
              </p>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
                Generated on {new Date().toLocaleDateString("en-US")}
              </p>
            </div>

            {/* Download Button */}
            <div className="mt-6 flex justify-end">
              <NeuButton onClick={downloadPayslip} variant="accent">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </NeuButton>
            </div>
          </NeuCardContent>
        </NeuCard>
      )}
    </div>
  );
}
