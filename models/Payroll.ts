import mongoose from "mongoose";
import { IPayroll } from "@/types";

const payrollSchema = new mongoose.Schema<IPayroll>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be 1-12"],
      max: [12, "Month must be 1-12"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    absentDays: {
      type: Number,
      default: 0,
    },
    lateDays: {
      type: Number,
      default: 0,
    },
    leaveDays: {
      type: Number,
      default: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0,
    },
    absentDeduction: {
      type: Number,
      default: 0,
    },
    lateDeduction: {
      type: Number,
      default: 0,
    },
    unpaidLeaveDeduction: {
      type: Number,
      default: 0,
    },
    bonuses: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: [true, "Net salary is required"],
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique payroll per user per month/year
payrollSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

// Index for month/year queries
payrollSchema.index({ month: 1, year: 1 });

// Index for status
payrollSchema.index({ status: 1 });

// Prevent model overwrite during hot reload in development
const Payroll =
  mongoose.models.Payroll ||
  mongoose.model<IPayroll>("Payroll", payrollSchema);

export default Payroll;
