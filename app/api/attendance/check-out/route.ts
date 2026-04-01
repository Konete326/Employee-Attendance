import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Shift from "@/models/Shift";
import { ApiResponse, CheckOutRequestBody } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    const todayStr = new Date().toISOString().split("T")[0];

    // Find today's attendance record
    const record = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (!record) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "No check-in found for today",
          code: "NO_CHECKIN",
        },
        { status: 400 }
      );
    }

    if (record.checkOut) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Already checked out today",
          code: "ALREADY_CHECKED_OUT",
        },
        { status: 400 }
      );
    }

    const checkOutTime = new Date();
    const workingMs = checkOutTime.getTime() - record.checkIn.getTime();
    const workingMinutes = Math.floor(workingMs / (1000 * 60));
    const hoursWorked = Number((workingMinutes / 60).toFixed(2));

    // Get user shift to determine half-day threshold
    let isHalfDay = false;
    const userDoc = await User.findById(user.userId).populate("shift");
    if (userDoc?.shift) {
      const shift = userDoc.shift as { workingHours: number };
      // Half-day if worked less than half of shift hours
      const halfDayThreshold = (shift.workingHours * 60) / 2;
      isHalfDay = workingMinutes < halfDayThreshold;
    }

    // Parse request body
    let body: CheckOutRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    // Update record
    record.checkOut = checkOutTime;
    record.hoursWorked = hoursWorked;
    record.workingMinutes = workingMinutes;
    
    // Update status to half-day if applicable (but keep late if already marked)
    if (isHalfDay && record.status !== "late") {
      record.status = "half-day";
    }
    
    if (body.notes) {
      record.notes = record.notes ? `${record.notes} | ${body.notes}` : body.notes;
    }
    
    await record.save();

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: isHalfDay ? "Check-out recorded (Half Day)" : "Check-out successful",
        data: {
          _id: record._id,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          hoursWorked: record.hoursWorked,
          workingMinutes: record.workingMinutes,
          status: record.status,
          isHalfDay,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
