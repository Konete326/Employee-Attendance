import mongoose from "mongoose";
import { IAttendance, AttendanceStatus } from "@/types";

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in time is required"],
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day", "on-leave"] as AttendanceStatus[],
      default: "present",
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    overriddenAt: {
      type: Date,
      default: null,
    },
    outOfOffice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique daily records per user
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for faster date range queries
attendanceSchema.index({ date: 1 });

// Index for user lookups
attendanceSchema.index({ userId: 1 });

// Index for status queries
attendanceSchema.index({ status: 1 });

// Prevent model overwrite during hot reload in development
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
