import mongoose from "mongoose";
import { IUser, UserRole } from "@/types";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "employee"] as UserRole[],
      default: "employee",
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
    salary: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leaveBalance: {
      type: {
        annual: { type: Number, default: 20 },
        sick: { type: Number, default: 10 },
        casual: { type: Number, default: 5 },
      },
      default: () => ({ annual: 20, sick: 10, casual: 5 }),
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Prevent model overwrite during hot reload in development
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;