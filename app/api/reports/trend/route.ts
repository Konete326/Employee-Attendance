import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import { ApiResponse } from "@/types";

// GET /api/reports/trend?months=6
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const monthsCount = parseInt(searchParams.get("months") || "6");

    await connectDB();

    const trends = [];
    const now = new Date();

    // Generate data for last N months
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const startStr = startOfMonth.toISOString().split("T")[0];
      const endStr = endOfMonth.toISOString().split("T")[0];

      // Get all attendance records for this month
      const attendanceRecords = await Attendance.find({
        date: { $gte: startStr, $lte: endStr },
      }).lean();

      const present = attendanceRecords.filter(
        (r) => r.status === "present"
      ).length;
      const absent = attendanceRecords.filter((r) => r.status === "absent").length;
      const late = attendanceRecords.filter((r) => r.status === "late").length;
      const onLeave = attendanceRecords.filter((r) => r.status === "on-leave").length;
      const halfDay = attendanceRecords.filter((r) => r.status === "half-day").length;

      const monthName = date.toLocaleString("en-US", { month: "short", year: "numeric" });

      trends.push({
        month: monthName,
        year,
        monthNumber: month,
        present,
        absent,
        late,
        onLeave,
        halfDay,
        total: attendanceRecords.length,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: trends,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get trend report error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trend report",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
