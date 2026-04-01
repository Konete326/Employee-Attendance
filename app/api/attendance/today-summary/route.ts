import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/attendance/today-summary - Get today's attendance summary
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    const todayStr = new Date().toISOString().split("T")[0];

    // Get total active employees
    const totalEmployees = await User.countDocuments({ isActive: true });

    // Get today's attendance records
    const todayRecords = await Attendance.find({ date: todayStr });

    // Calculate summary
    const presentToday = todayRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const absentToday = todayRecords.filter((r) => r.status === "absent").length;
    const lateToday = todayRecords.filter((r) => r.status === "late").length;
    const onLeaveToday = todayRecords.filter((r) => r.status === "on-leave").length;

    // Employees who haven't checked in yet
    const notCheckedIn = totalEmployees - todayRecords.length;

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: {
          totalEmployees,
          presentToday,
          absentToday,
          lateToday,
          onLeaveToday,
          notCheckedIn,
          date: todayStr,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get today summary error:", error);
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
