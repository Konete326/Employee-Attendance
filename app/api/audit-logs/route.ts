import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import AuditLog from "@/models/AuditLog";
import { ApiResponse } from "@/types";

// Helper to create audit log entry
export async function createAuditLog(
  performedBy: string,
  action: string,
  targetModel: string,
  targetId: string,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      performedBy,
      action,
      targetModel,
      targetId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Create audit log error:", error);
  }
}

// GET /api/audit-logs - Get all audit logs (admin only)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const targetModel = searchParams.get("targetModel");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    let query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (targetModel) query.targetModel = targetModel;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("performedBy", "name email")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch audit logs",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
