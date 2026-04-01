import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/reports/top-performers?month=1&year=2025&limit=10
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
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    // Build date range
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const startStr = startOfMonth.toISOString().split("T")[0];
    const endStr = endOfMonth.toISOString().split("T")[0];

    const workingDays = 26; // Standard working days

    // Get all active employees
    const employees = await User.find({ isActive: true })
      .select("_id name employeeId department")
      .populate("department", "name")
      .lean();

    // Calculate stats for each employee
    const performerStats = await Promise.all(
      employees.map(async (emp) => {
        const attendanceRecords = await Attendance.find({
          userId: emp._id,
          date: { $gte: startStr, $lte: endStr },
        }).lean();

        const presentDays = attendanceRecords.filter(
          (r) => r.status === "present"
        ).length;
        const lateDays = attendanceRecords.filter((r) => r.status === "late").length;
        const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;

        // Present + late count as "attended"
        const attendedDays = presentDays + lateDays;
        const attendanceRate =
          workingDays > 0 ? Math.round((attendedDays / workingDays) * 100) : 0;

        // Punctuality score: 100 - (lateDays * 3.85) [each late costs ~3.85%]
        const punctualityScore = Math.max(0, Math.round(100 - lateDays * 3.85));

        return {
          userId: emp._id.toString(),
          name: (emp as unknown as { name: string }).name,
          employeeId: (emp as unknown as { employeeId?: string }).employeeId || "N/A",
          department:
            (emp as unknown as { department?: { name?: string } }).department?.name || "N/A",
          presentDays,
          absentDays,
          lateDays,
          attendanceRate,
          punctualityScore,
        };
      })
    );

    // Sort: attendanceRate DESC, then lateDays ASC, then punctualityScore DESC
    const sortedPerformers = performerStats.sort((a, b) => {
      if (b.attendanceRate !== a.attendanceRate) {
        return b.attendanceRate - a.attendanceRate;
      }
      if (a.lateDays !== b.lateDays) {
        return a.lateDays - b.lateDays;
      }
      return b.punctualityScore - a.punctualityScore;
    });

    // Return top N
    const topPerformers = sortedPerformers.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        data: topPerformers,
        meta: { month, year, limit, totalEmployees: employees.length },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get top performers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch top performers",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
