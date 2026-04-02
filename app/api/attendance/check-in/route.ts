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

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 1. Auto-checkout dangling sessions from previous days (> 12 hours)
    // Find any record from this user that HAS NO checkout and was created more than 12 hours ago
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const danglingRecord = await Attendance.findOne({
      userId: user.userId,
      checkOut: null,
      checkIn: { $lt: twelveHoursAgo }
    });

    if (danglingRecord) {
      // Auto checkout at +12 hours from check-in or right now
      const autoCheckOutTime = new Date(danglingRecord.checkIn.getTime() + 12 * 60 * 60 * 1000);
      danglingRecord.checkOut = autoCheckOutTime > now ? now : autoCheckOutTime;
      danglingRecord.workingMinutes = 12 * 60; // Max 12 hours
      danglingRecord.hoursWorked = 12;
      danglingRecord.notes = danglingRecord.notes 
        ? `${danglingRecord.notes} | Auto-checkout after 12h` 
        : "Auto-checkout after 12h";
      await danglingRecord.save();
    }

    // 2. Check if already checked in today (Strict: 1 check-in per day)
    const existingRecord = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (existingRecord) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "You have already checked in for today. Multiple check-ins per day are not allowed.",
          code: "ALREADY_CHECKED_IN",
        },
        { status: 400 }
      );
    }

    // 3. Get user with shift info (Handle BSON error if shift is a legacy string)
    let userDoc;
    let isLate = false;
    try {
      userDoc = await User.findById(user.userId).populate("shift").exec();
      
      if (userDoc?.shift && typeof userDoc.shift === 'object') {
        const shift = userDoc.shift as any;
        if (shift.startTime) {
          const [shiftHour, shiftMinute] = shift.startTime.split(":").map(Number);
          const checkInHour = now.getHours();
          const checkInMinute = now.getMinutes();
          
          const shiftStartMinutes = shiftHour * 60 + shiftMinute;
          const checkInMinutes = checkInHour * 60 + checkInMinute;
          const minutesLate = checkInMinutes - shiftStartMinutes;
          
          isLate = minutesLate > (shift.lateThresholdMinutes || 15);
        }
      }
    } catch (e) {
      console.error("Migration/Populate warning in check-in:", e);
      // Fallback: Skip late calculation if shift data is corrupted/legacy
      userDoc = await User.findById(user.userId).exec();
    }

    // Parse request body
    let body: CheckInRequestBody = {};
    try {
      body = await request.json();
    } catch { }

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
    
    // Check if it's a BSON Error specifically
    if (error instanceof Error && error.message.includes("Cast to ObjectId failed")) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Your profile has outdated data. Please update your profile or contact admin to fix your Shift/Department info.",
          code: "LEGACY_DATA_ERROR",
        },
        { status: 400 }
      );
    }

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
