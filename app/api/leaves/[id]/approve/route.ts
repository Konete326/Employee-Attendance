import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/middleware-helpers";
import Leave from "@/models/Leave";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { ApiResponse, ApproveLeaveBody } from "@/types";

// PUT /api/leaves/[id]/approve - Admin approves leave
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

    const adminId = authResult.userId;
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

    // Deduct leave balance (skip for unpaid)
    if (leave.leaveType !== "unpaid") {
      const user = await User.findById(leave.userId);
      if (user?.leaveBalance) {
        const available = user.leaveBalance[leave.leaveType] || 0;
        if (leave.totalDays > available) {
          return NextResponse.json(
            {
              success: false,
              error: `Employee has insufficient ${leave.leaveType} leave balance`,
              code: "INSUFFICIENT_BALANCE",
            },
            { status: 400 }
          );
        }
        user.leaveBalance[leave.leaveType] = available - leave.totalDays;
        await user.save();
      }
    }

    // Approve leave
    leave.status = "approved";
    leave.approvedBy = adminId;
    leave.adminComment = body.adminComment || "";
    await leave.save();

    // Create attendance records for leave period
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const attendanceRecords = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = d.toISOString().split("T")[0];
        
        // Check if attendance record already exists
        const existing = await Attendance.findOne({
          userId: leave.userId,
          date: dateStr,
        });

        if (!existing) {
          attendanceRecords.push({
            userId: leave.userId,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            status: "on-leave",
            hoursWorked: 0,
            workingMinutes: 0,
            notes: `On ${leave.leaveType} leave`,
          });
        }
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate("userId", "name email")
      .populate("approvedBy", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedLeave,
        message: "Leave request approved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to approve leave",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
