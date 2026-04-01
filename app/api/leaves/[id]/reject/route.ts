import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Leave from "@/models/Leave";
import { ApiResponse, ApproveLeaveBody } from "@/types";
import { createNotification } from "@/lib/notifications";

// PUT /api/leaves/[id]/reject - Admin rejects leave
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body: ApproveLeaveBody = await request.json();

    await connectDB();

    // Find leave request
    const leave = await Leave.findById(id);
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
          error: `Leave request is already ${leave.status}`,
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    // Reject leave
    leave.status = "rejected";
    leave.approvedBy = authResult.userId;
    leave.adminComment = body.adminComment || "";
    await leave.save();

    // Create notification for the user
    await createNotification({
      userId: leave.userId,
      title: "Leave Rejected",
      message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been rejected.${body.adminComment ? ` Reason: ${body.adminComment}` : ""}`,
      type: "error",
      link: "/employee/leaves",
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate("userId", "name email")
      .populate("approvedBy", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedLeave,
        message: "Leave request rejected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reject leave",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
