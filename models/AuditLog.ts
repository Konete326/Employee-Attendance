import mongoose from "mongoose";
import { IAuditLog } from "@/types";

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    targetModel: {
      type: String,
      required: [true, "Target model is required"],
      trim: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target ID is required"],
    },
    oldValues: {
      type: Object,
      default: null,
    },
    newValues: {
      type: Object,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for timestamp queries (newest first)
auditLogSchema.index({ timestamp: -1 });

// Index for user lookups
auditLogSchema.index({ performedBy: 1 });

// Index for target lookups
auditLogSchema.index({ targetModel: 1, targetId: 1 });

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
