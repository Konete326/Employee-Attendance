import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/reports/monthly - Get monthly attendance breakdown
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

    // Get all attendance records for the month
    const records = await Attendance.find({
      date: {
        $gte: startOfMonth.toISOString().split("T")[0],
        $lte: endOfMonth.toISOString().split("T")[0],
      },
    }).populate("userId", "name department");

    // Group by date for daily stats
    const dailyStats: Record<string, { present: number; absent: number; late: number; leave: number }> = {};

    for (let d = 1; d <= endOfMonth.getDate(); d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dailyStats[dateStr] = { present: 0, absent: 0, late: 0, leave: 0 };
    }

    records.forEach((record) => {
      if (dailyStats[record.date]) {
        if (record.status === "present") dailyStats[record.date].present++;
        else if (record.status === "absent") dailyStats[record.date].absent++;
        else if (record.status === "late") dailyStats[record.date].late++;
        else if (record.status === "on-leave") dailyStats[record.date].leave++;
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          month,
          year,
          dailyStats,
          totalRecords: records.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get monthly report error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch report",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
