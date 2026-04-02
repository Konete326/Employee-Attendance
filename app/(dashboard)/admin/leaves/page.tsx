"use client";

import { useEffect, useState } from "react";
import { NeuCard, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/neu-toast";
import { ChipLoader } from "@/components/ui/chip-loader";

interface LeaveRequest {
  _id: string;
  userId: { name: string; email: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const url = filter !== "all" ? `/api/leaves/all?status=${filter}` : "/api/leaves/all";
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLeaves(data.data);
      } else {
        toastError(data.error || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
      toastError("An unexpected error occurred while fetching leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/leaves/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        toastSuccess("Leave request approved successfully");
        fetchLeaves();
      } else {
        toastError(data.error || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Failed to approve leave", error);
      toastError("An unexpected error occurred during approval");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/leaves/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminComment: "Rejected by admin" }),
      });
      if (response.ok) {
        fetchLeaves();
      }
    } catch (error) {
      console.error("Failed to reject leave", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <NeuBadge variant="success">Approved</NeuBadge>;
      case "rejected":
        return <NeuBadge variant="error">Rejected</NeuBadge>;
      default:
        return <NeuBadge variant="warning">Pending</NeuBadge>;
    }
  };

  // Note: We use the overlay mode in the return block instead of an early return 
  // to prevent layout jumps and allow the user to see the background structure while loading.

  const isLoading = loading;

  return (
    <div className="relative space-y-6" style={{ minHeight: "400px" }}>
      {/* Overlay loader — blurs behind without shifting layout */}
      {isLoading && (
        <ChipLoader overlay size="md" label="Loading" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Leave Management</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 flex-1 sm:flex-none text-center rounded-lg text-sm capitalize transition-all duration-200 ${
                filter === f
                  ? "bg-[var(--neu-accent)] text-white shadow-sm scale-105"
                  : "bg-[var(--neu-surface)] text-[var(--neu-text-secondary)] hover:bg-[var(--neu-surface-light)] hover:text-[var(--neu-text)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Leaves Table */}
      <NeuCard>
        <NeuCardContent className="p-6">
          {leaves.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No leave requests"
              description={`No ${filter !== "all" ? filter : ""} leave requests found.`}
            />
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--neu-border)]">
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Employee</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Dates</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Days</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[var(--neu-text-secondary)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-[var(--neu-border)] last:border-0">
                      <td className="py-4 px-4">
                        <p className="font-medium">{leave.userId?.name}</p>
                      </td>
                      <td className="py-4 px-4 capitalize">{leave.leaveType}</td>
                      <td className="py-4 px-4">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">{leave.totalDays}</td>
                      <td className="py-4 px-4">{getStatusBadge(leave.status)}</td>
                      <td className="py-4 px-4">
                        {leave.status === "pending" && (
                          <div className="flex gap-2">
                            <NeuButton
                              size="sm"
                              variant="accent"
                              onClick={() => handleApprove(leave._id)}
                              loading={actionLoading === leave._id}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </NeuButton>
                            <NeuButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(leave._id)}
                              loading={actionLoading === leave._id}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </NeuButton>
                          </div>
                        )}
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
