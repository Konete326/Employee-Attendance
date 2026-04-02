"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuInput } from "@/components/ui/neu-input";
import { NeuBadge } from "@/components/ui/neu-badge";
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
import { IDepartment } from "@/types";

interface DepartmentFormData {
  name: string;
  description: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<IDepartment | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      } else {
        setError(data.error || "Failed to fetch departments");
      }
    } catch (err) {
      setError("Failed to fetch departments");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Open modal for create/edit
  const openModal = (department?: IDepartment) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData({ name: "", description: "" });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment._id}`
        : "/api/departments";
      const method = editingDepartment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        closeModal();
        fetchDepartments();
      } else {
        setError(data.error || "Failed to save department");
      }
    } catch (err) {
      setError("Failed to save department");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchDepartments();
      } else {
        setError(data.error || "Failed to delete department");
      }
    } catch (err) {
      setError("Failed to delete department");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--neu-text)] flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[var(--neu-accent)]" />
            Departments
          </h1>
          <p className="text-[var(--neu-text-secondary)] mt-1">
            Manage company departments
          </p>
        </div>
        <NeuButton onClick={() => openModal()} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </NeuButton>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-[var(--neu-danger)]/10 border border-[var(--neu-danger)]/30 text-[var(--neu-danger)]">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Departments Table */}
      <NeuCard>
        <NeuCardHeader>
          <NeuCardTitle>All Departments</NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--neu-accent)]" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-[var(--neu-text-secondary)]">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No departments found</p>
              <p className="text-sm mt-1">Click &quot;Add Department&quot; to create one</p>
            </div>
          ) : (
            <List2 
              items={departments.map((dept) => ({
                icon: <Building2 className="w-5 h-5 text-[var(--neu-accent)]" />,
                title: dept.name,
                category: "DEPARTMENT",
                description: dept.description || "No description provided.",
                onClick: () => openModal(dept),
                status: (
                  <div className="flex items-center gap-3">
                    <NeuBadge variant={dept.isActive ? ("success" as const) : ("default" as const)}>
                      {dept.isActive ? "Active" : "Inactive"}
                    </NeuBadge>
                    <NeuButton
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dept._id.toString());
                      }}
                      className="text-[var(--neu-danger)] hover:bg-[var(--neu-danger)]/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </NeuButton>
                  </div>
                )
              }))}
            />
          )}
        </NeuCardContent>
      </NeuCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md">
            <NeuCard>
              <NeuCardHeader>
                <NeuCardTitle>
                  {editingDepartment ? "Edit Department" : "Add Department"}
                </NeuCardTitle>
              </NeuCardHeader>
              <form onSubmit={handleSubmit}>
                <NeuCardContent className="space-y-4">
                  <NeuInput
                    label="Department Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Engineering"
                  />
                  <NeuInput
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the department"
                  />
                </NeuCardContent>
                <div className="flex items-center justify-end gap-3 p-6 pt-0">
                  <NeuButton type="button" variant="ghost" onClick={closeModal}>
                    Cancel
                  </NeuButton>
                  <NeuButton
                    type="submit"
                    variant="accent"
                    loading={isSubmitting}
                    disabled={!formData.name.trim()}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {editingDepartment ? "Update" : "Create"}
                  </NeuButton>
                </div>
              </form>
            </NeuCard>
          </div>
        </div>
      )}
    </div>
  );
}
