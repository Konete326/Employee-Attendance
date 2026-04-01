import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Leave from "@/models/Leave";
import { ApiResponse } from "@/types";

// GET /api/leaves/my - Get employee's own leave requests
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const year = searchParams.get("year");

    // Build query
    let query: Record<string, unknown> = { userId: user.userId };

    if (status) {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await Leave.find(query)
      .populate("approvedBy", "name")
      .sort({ appliedAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: leaves,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get my leaves error:", error);
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

// DELETE /api/leaves/my - Cancel pending leave request
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const leaveId = searchParams.get("id");

    if (!leaveId) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave ID is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const leave = await Leave.findOne({
      _id: leaveId,
      userId: user.userId,
    });

    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave request not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (leave.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel ${leave.status} leave request`,
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    await Leave.findByIdAndDelete(leaveId);

    return NextResponse.json(
      {
        success: true,
        message: "Leave request cancelled successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel leave request",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
