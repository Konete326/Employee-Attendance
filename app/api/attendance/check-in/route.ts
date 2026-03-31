import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
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

    const existingRecord = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (existingRecord) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Already checked in today",
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);

    let body: CheckInRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const attendance = await Attendance.create({
      userId: user.userId,
      date: todayStr,
      checkIn: now,
      status: isLate ? "late" : "present",
      notes: body.notes || "",
    });

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Check-in successful",
        data: {
          _id: attendance._id,
          date: attendance.date,
          checkIn: attendance.checkIn,
          status: attendance.status,
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
      },
      { status: 500 }
    );
  }
}
