import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Shift from "@/models/Shift";
import { ApiResponse, CheckInRequestBody } from "@/types";

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

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (existingRecord) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Already checked in today",
          code: "ALREADY_CHECKED_IN",
        },
        { status: 400 }
      );
    }

    // Get user with shift info
    const userDoc = await User.findById(user.userId).populate("shift");
    let isLate = false;
    
    if (userDoc?.shift) {
      const shift = userDoc.shift as { startTime: string; lateThresholdMinutes: number };
      const [shiftHour, shiftMinute] = shift.startTime.split(":").map(Number);
      const now = new Date();
      const checkInHour = now.getHours();
      const checkInMinute = now.getMinutes();
      
      // Calculate minutes since shift start
      const shiftStartMinutes = shiftHour * 60 + shiftMinute;
      const checkInMinutes = checkInHour * 60 + checkInMinute;
      const minutesLate = checkInMinutes - shiftStartMinutes;
      
      // Mark as late if beyond threshold
      isLate = minutesLate > (shift.lateThresholdMinutes || 15);
    }

    // Parse request body
    let body: CheckInRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const now = new Date();

    // Create attendance record
    const attendance = await Attendance.create({
      userId: user.userId,
      date: todayStr,
      checkIn: now,
      status: isLate ? "late" : "present",
      notes: body.notes || "",
      location: body.lat && body.lng ? { lat: body.lat, lng: body.lng } : { lat: null, lng: null },
    });

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: isLate ? "Check-in recorded (Late)" : "Check-in successful",
        data: {
          _id: attendance._id,
          date: attendance.date,
          checkIn: attendance.checkIn,
          status: attendance.status,
          isLate,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Check-in error:", error);
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
