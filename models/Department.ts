import mongoose from "mongoose";
import { IDepartment } from "@/types";

const departmentSchema = new mongoose.Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
departmentSchema.index({ name: 1 });

// Index for active status
departmentSchema.index({ isActive: 1 });

// Prevent model overwrite during hot reload in development
const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
