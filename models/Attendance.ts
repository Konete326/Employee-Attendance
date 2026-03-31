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
      type: String, // YYYY-MM-DD format for easy querying
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
      enum: ["present", "absent", "late"] as AttendanceStatus[],
      default: "present",
    },
    hoursWorked: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
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

// Prevent model overwrite during hot reload in development
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
