"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuSelect } from "@/components/ui/neu-select";
import { NeuButton } from "@/components/ui/neu-button";

interface Employee {
  _id: string;
  name: string;
  email: string;
}

export interface FilterState {
  month: string;
  employeeId: string;
  status: string;
  search: string;
}

interface AttendanceFiltersProps {
  onFilter: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

export function AttendanceFilters({ onFilter, initialFilters }: AttendanceFiltersProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const [filters, setFilters] = useState<FilterState>({
    month: initialFilters?.month || getCurrentMonth(),
    employeeId: initialFilters?.employeeId || "",
    status: initialFilters?.status || "",
    search: initialFilters?.search || "",
  });

  // Fetch employees for dropdown
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    }
    fetchEmployees();
  }, []);

  const employeeOptions = [
    { value: "", label: "All Employees" },
    ...employees.map((emp) => ({
      value: emp._id,
      label: emp.name,
    })),
  ];

  const handleApply = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      month: getCurrentMonth(),
      employeeId: "",
      status: "",
      search: "",
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        {/* Month Picker */}
        <NeuInput
          type="month"
          label="Month"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="w-full"
        />

        {/* Employee Dropdown */}
        <NeuSelect
          label="Employee"
          options={employeeOptions}
          value={filters.employeeId}
          onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
          disabled={isLoadingEmployees}
          placeholder="Select employee"
          className="w-full"
        />

        {/* Status Dropdown */}
        <NeuSelect
          label="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder="Select status"
          className="w-full"
        />

        {/* Search Input */}
        <NeuInput
          type="text"
          label="Search"
          placeholder="Search name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          icon={<Search className="w-4 h-4" />}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full lg:w-auto">
        <NeuButton variant="accent" onClick={handleApply} className="flex-1 lg:flex-none h-11 px-8 shadow-[0_0_20px_-5px_var(--neu-accent)]">
          Apply Filters
        </NeuButton>
        <NeuButton variant="ghost" onClick={handleReset} className="flex-1 lg:flex-none h-11">
          Reset
        </NeuButton>
      </div>
    </div>
  );
}
