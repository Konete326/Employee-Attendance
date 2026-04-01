import mongoose from "mongoose";
import { ILeave } from "@/types";

const leaveSchema = new mongoose.Schema<ILeave>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "annual", "unpaid"],
      required: [true, "Leave type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      required: [true, "Total days is required"],
      min: [1, "Total days must be at least 1"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminComment: {
      type: String,
      default: "",
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user lookups
leaveSchema.index({ userId: 1 });

// Index for status queries
leaveSchema.index({ status: 1 });

// Index for date range queries
leaveSchema.index({ startDate: 1, endDate: 1 });

// Compound index for user + status
leaveSchema.index({ userId: 1, status: 1 });

// Prevent model overwrite during hot reload in development
const Leave =
  mongoose.models.Leave || mongoose.model<ILeave>("Leave", leaveSchema);

export default Leave;
