"use client";

import { useState, useEffect } from "react";
import { ScrollText, Loader2, ChevronLeft, ChevronRight, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";
import { NeuSelect } from "@/components/ui/neu-select";
import { NeuInput } from "@/components/ui/neu-input";
import {
  NeuTable,
  NeuTableHeader,
  NeuTableBody,
  NeuTableRow,
  NeuTableHead,
  NeuTableCell,
} from "@/components/ui/neu-table";
import { EmptyState } from "@/components/ui/empty-state";
import { List2, ListItem } from "@/components/ui/list-2";
import { User as UserIcon, Calendar as CalendarIcon, Activity, Eye } from "lucide-react";

interface AuditLog {
  _id: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "OVERRIDE";
  targetModel: string;
  targetId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionOptions = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "OVERRIDE", label: "Override" },
];

const targetModelOptions = [
  { value: "", label: "All Targets" },
  { value: "User", label: "User" },
  { value: "Attendance", label: "Attendance" },
  { value: "Leave", label: "Leave" },
  { value: "Payroll", label: "Payroll" },
  { value: "Department", label: "Department" },
  { value: "Shift", label: "Shift" },
];

const ITEMS_PER_PAGE = 20;

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    action: "",
    targetModel: "",
    fromDate: "",
    toDate: "",
  });

  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(ITEMS_PER_PAGE));

      if (filters.action) params.append("action", filters.action);
      if (filters.targetModel) params.append("targetModel", filters.targetModel);

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch audit logs");
      }
    } catch (err) {
      setError("Failed to fetch audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters.action, filters.targetModel]);

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  const toggleRowExpansion = (logId: string) => {
    setExpandedRow(expandedRow === logId ? null : logId);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "accent";
      case "DELETE":
        return "error";
      case "LOGIN":
      case "LOGOUT":
        return "default";
      case "OVERRIDE":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChanges = (oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) => {
    if (!oldValues && !newValues) return null;

    const changes: { field: string; old: string; new: string }[] = [];

    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ]);

    allKeys.forEach((key) => {
      const oldVal = oldValues?.[key];
      const newVal = newValues?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          old: oldVal !== undefined ? JSON.stringify(oldVal) : "(not set)",
          new: newVal !== undefined ? JSON.stringify(newVal) : "(not set)",
        });
      }
    });

    return changes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--neu-text)]">Audit Logs</h1>
        <p className="text-[var(--neu-text-secondary)]">
          Track all admin actions and system changes for accountability
        </p>
      </div>

      {/* Filters */}
      <NeuCard variant="flat">
        <NeuCardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                Action Type
              </label>
              <NeuSelect
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                options={actionOptions}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                Target Model
              </label>
              <NeuSelect
                value={filters.targetModel}
                onChange={(e) => setFilters({ ...filters, targetModel: e.target.value })}
                options={targetModelOptions}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                From Date
              </label>
              <NeuInput
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[var(--neu-text)] mb-2">
                To Date
              </label>
              <NeuInput
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>
            <NeuButton
              variant="outline"
              onClick={() => setFilters({ action: "", targetModel: "", fromDate: "", toDate: "" })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </NeuButton>
          </div>
        </NeuCardContent>
      </NeuCard>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <NeuCard>
        <NeuCardHeader>
          <NeuCardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Activity Log
          </NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--neu-accent)]" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No Audit Logs"
              description="No activity recorded matching your filters"
            />
          ) : (
            <>
              <List2 
                items={logs.map((log) => ({
                  icon: <Activity className="w-5 h-5 text-[var(--neu-accent)]" />,
                  title: log.performedBy?.name || "Unknown Admin",
                  category: log.action,
                  description: (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 opacity-80">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="text-sm opacity-60">
                        Target: {log.targetModel} ({log.targetId.slice(-6)})
                      </div>
                    </div>
                  ),
                  status: (
                    <div className="flex items-center gap-3">
                      <NeuBadge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </NeuBadge>
                    </div>
                  ),
                  onClick: () => toggleRowExpansion(log._id),
                  children: expandedRow === log._id && (log.oldValues || log.newValues) ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-[var(--neu-text)] text-sm">Action Details & Changes</h4>
                      {formatChanges(log.oldValues, log.newValues)?.map((change, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white/5 rounded-lg border border-white/5"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">
                              Field
                            </span>
                            <p className="font-medium text-sm text-[var(--neu-accent)]">{change.field}</p>
                          </div>
                          <div className="bg-red-500/5 p-2 rounded">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                              Old
                            </span>
                            <p className="font-mono text-xs opacity-70 break-all">{change.old}</p>
                          </div>
                          <div className="bg-green-500/5 p-2 rounded">
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                              New
                            </span>
                            <p className="font-mono text-xs opacity-70 break-all">{change.new}</p>
                          </div>
                        </div>
                      ))}
                      {log.ipAddress && (
                        <p className="text-[10px] text-[var(--neu-text-secondary)] uppercase font-bold text-right pt-2 border-t border-white/5">
                          IP: {log.ipAddress} • ID: {log._id}
                        </p>
                      )}
                    </div>
                  ) : null
                }))}
              />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--neu-border)]">
                  <p className="text-sm text-[var(--neu-text-secondary)]">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <NeuButton
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </NeuButton>
                    <span className="text-sm text-[var(--neu-text)]">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <NeuButton
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </NeuButton>
                  </div>
                </div>
              )}
            </>
          )}
        </NeuCardContent>
      </NeuCard>
    </div>
  );
}
