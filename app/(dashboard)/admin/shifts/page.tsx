"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
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
import { IShift } from "@/types";

interface ShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  lateThresholdMinutes: number;
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<IShift | null>(null);
  const [formData, setFormData] = useState<ShiftFormData>({
    name: "",
    startTime: "",
    endTime: "",
    workingHours: 8,
    lateThresholdMinutes: 15,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch shifts
  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shifts");
      const data = await response.json();
      if (data.success) {
        setShifts(data.data);
      } else {
        setError(data.error || "Failed to fetch shifts");
      }
    } catch (err) {
      setError("Failed to fetch shifts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Open modal for create/edit
  const openModal = (shift?: IShift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        workingHours: shift.workingHours,
        lateThresholdMinutes: shift.lateThresholdMinutes,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        workingHours: 8,
        lateThresholdMinutes: 15,
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      workingHours: 8,
      lateThresholdMinutes: 15,
    });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingShift ? `/api/shifts/${editingShift._id}` : "/api/shifts";
      const method = editingShift ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        closeModal();
        fetchShifts();
      } else {
        setError(data.error || "Failed to save shift");
      }
    } catch (err) {
      setError("Failed to save shift");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;

    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchShifts();
      } else {
        setError(data.error || "Failed to delete shift");
      }
    } catch (err) {
      setError("Failed to delete shift");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--neu-text)] flex items-center gap-3">
            <Clock className="w-8 h-8 text-[var(--neu-accent)]" />
            Shifts
          </h1>
          <p className="text-[var(--neu-text-secondary)] mt-1">
            Manage employee work shifts
          </p>
        </div>
        <NeuButton onClick={() => openModal()} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
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

      {/* Shifts Table */}
      <NeuCard>
        <NeuCardHeader>
          <NeuCardTitle>All Shifts</NeuCardTitle>
        </NeuCardHeader>
        <NeuCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--neu-accent)]" />
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-12 text-[var(--neu-text-secondary)]">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No shifts found</p>
              <p className="text-sm mt-1">Click &quot;Add Shift&quot; to create one</p>
            </div>
          ) : (
            <NeuTable>
              <NeuTableHeader>
                <NeuTableRow>
                  <NeuTableHead>Name</NeuTableHead>
                  <NeuTableHead>Time</NeuTableHead>
                  <NeuTableHead>Hours</NeuTableHead>
                  <NeuTableHead>Late Threshold</NeuTableHead>
                  <NeuTableHead>Status</NeuTableHead>
                  <NeuTableHead className="text-right">Actions</NeuTableHead>
                </NeuTableRow>
              </NeuTableHeader>
              <NeuTableBody>
                {shifts.map((shift) => (
                  <NeuTableRow key={shift._id.toString()}>
                    <NeuTableCell className="font-medium">{shift.name}</NeuTableCell>
                    <NeuTableCell className="text-[var(--neu-text-secondary)]">
                      {shift.startTime} - {shift.endTime}
                    </NeuTableCell>
                    <NeuTableCell>{shift.workingHours}h</NeuTableCell>
                    <NeuTableCell>{shift.lateThresholdMinutes} min</NeuTableCell>
                    <NeuTableCell>
                      <NeuBadge variant={shift.isActive ? ("success" as const) : ("default" as const)}>
                        {shift.isActive ? "Active" : "Inactive"}
                      </NeuBadge>
                    </NeuTableCell>
                    <NeuTableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NeuButton size="icon" variant="ghost" onClick={() => openModal(shift)}>
                          <Pencil className="w-4 h-4" />
                        </NeuButton>
                        <NeuButton
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(shift._id.toString())}
                          className="text-[var(--neu-danger)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </NeuButton>
                      </div>
                    </NeuTableCell>
                  </NeuTableRow>
                ))}
              </NeuTableBody>
            </NeuTable>
          )}
        </NeuCardContent>
      </NeuCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md">
            <NeuCard>
              <NeuCardHeader>
                <NeuCardTitle>{editingShift ? "Edit Shift" : "Add Shift"}</NeuCardTitle>
              </NeuCardHeader>
              <form onSubmit={handleSubmit}>
                <NeuCardContent className="space-y-4">
                  <NeuInput
                    label="Shift Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Morning Shift"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <NeuInput
                      label="Start Time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                    <NeuInput
                      label="End Time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <NeuInput
                      label="Working Hours"
                      type="number"
                      min={1}
                      max={24}
                      value={formData.workingHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workingHours: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                    <NeuInput
                      label="Late Threshold (min)"
                      type="number"
                      min={0}
                      max={60}
                      value={formData.lateThresholdMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lateThresholdMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </NeuCardContent>
                <div className="flex items-center justify-end gap-3 p-6 pt-0">
                  <NeuButton type="button" variant="ghost" onClick={closeModal}>
                    Cancel
                  </NeuButton>
                  <NeuButton
                    type="submit"
                    variant="accent"
                    loading={isSubmitting}
                    disabled={!formData.name.trim() || !formData.startTime || !formData.endTime}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {editingShift ? "Update" : "Create"}
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
