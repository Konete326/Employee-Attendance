import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Leave from "@/models/Leave";
import User from "@/models/User";
import { ApiResponse, ApplyLeaveBody } from "@/types";

// Helper to calculate working days (excluding weekends)
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const curDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

// POST /api/leaves/apply - Employee applies for leave
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const body: ApplyLeaveBody = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave type, start date, end date, and reason are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json(
        {
          success: false,
          error: "End date must be after start date",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check leave balance (skip for unpaid leave)
    if (leaveType !== "unpaid") {
      const userDoc = await User.findById(user.userId);
      if (userDoc?.leaveBalance) {
        const available = userDoc.leaveBalance[leaveType] || 0;
        const requestedDays = calculateWorkingDays(start, end);
        if (requestedDays > available) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient ${leaveType} leave balance. Available: ${available}, Requested: ${requestedDays}`,
              code: "INSUFFICIENT_BALANCE",
            },
            { status: 400 }
          );
        }
      }
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      userId: user.userId,
      status: { $in: ["pending", "approved"] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        {
          success: false,
          error: "You have an overlapping leave request for this period",
          code: "OVERLAPPING_LEAVE",
        },
        { status: 409 }
      );
    }

    // Create leave request
    const totalDays = calculateWorkingDays(start, end);
    const leave = await Leave.create({
      userId: user.userId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: "pending",
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate("userId", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedLeave,
        message: "Leave application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Apply leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply for leave",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
