import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
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

    const record = await Attendance.findOne({
      userId: user.userId,
      date: todayStr,
    });

    if (!record) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "No check-in found for today",
        },
        { status: 400 }
      );
    }

    if (record.checkOut) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Already checked out today",
        },
        { status: 400 }
      );
    }

    const checkOutTime = new Date();
    const hoursWorked = Number(
      ((checkOutTime.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60)).toFixed(2)
    );

    let body: CheckOutRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    record.checkOut = checkOutTime;
    record.hoursWorked = hoursWorked;
    if (body.notes) {
      record.notes = record.notes ? `${record.notes} | ${body.notes}` : body.notes;
    }
    await record.save();

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Check-out successful",
        data: {
          _id: record._id,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          hoursWorked: record.hoursWorked,
          status: record.status,
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
      },
      { status: 500 }
    );
  }
}
