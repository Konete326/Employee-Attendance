import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/reports/employee-stats - Get employee's own attendance stats
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1 + "");
    const year = parseInt(searchParams.get("year") || new Date().getFullYear() + "");

    await connectDB();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get employee's attendance records for the month
    const records = await Attendance.find({
      userId: user.userId,
      date: {
        $gte: startOfMonth.toISOString().split("T")[0],
        $lte: endOfMonth.toISOString().split("T")[0],
      },
    });

    // Calculate stats
    const stats = {
      presentDays: records.filter((r) => r.status === "present").length,
      absentDays: records.filter((r) => r.status === "absent").length,
      lateDays: records.filter((r) => r.status === "late").length,
      halfDays: records.filter((r) => r.status === "half-day").length,
      leaveDays: records.filter((r) => r.status === "on-leave").length,
      totalHours: records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          month,
          year,
          stats,
          records,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get employee stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stats",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
