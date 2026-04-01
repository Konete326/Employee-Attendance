import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Leave from "@/models/Leave";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/leaves/all - Admin view of all leave requests
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const month = searchParams.get("month");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    let query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (month) {
      const [year, monthNum] = month.split("-");
      const startOfMonth = new Date(`${year}-${monthNum}-01`);
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0);
      query.startDate = { $gte: startOfMonth, $lte: endOfMonth };
    }

    // If department filter, find users in that department first
    if (department) {
      const users = await User.find({ department }).select("_id");
      const userIds = users.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const skip = (page - 1) * limit;

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate("userId", "name email employeeId department")
        .populate("approvedBy", "name")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Leave.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: leaves,
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
    console.error("Get all leaves error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leave requests",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
