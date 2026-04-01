import mongoose from "mongoose";
import { IShift } from "@/types";

const shiftSchema = new mongoose.Schema<IShift>(
  {
    name: {
      type: String,
      required: [true, "Shift name is required"],
      unique: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },
    workingHours: {
      type: Number,
      required: [true, "Working hours is required"],
      min: [1, "Working hours must be at least 1"],
      max: [24, "Working hours cannot exceed 24"],
    },
    lateThresholdMinutes: {
      type: Number,
      default: 15,
      min: [0, "Late threshold cannot be negative"],
      max: [60, "Late threshold cannot exceed 60 minutes"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for name lookups
shiftSchema.index({ name: 1 });

// Index for active status
shiftSchema.index({ isActive: 1 });

// Prevent model overwrite during hot reload in development
const Shift =
  mongoose.models.Shift || mongoose.model<IShift>("Shift", shiftSchema);

export default Shift;
