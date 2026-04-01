import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import Department from "@/models/Department";
import User from "@/models/User";
import { ApiResponse } from "@/types";

// GET /api/reports/department?month=1&year=2025
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

    // Get all departments
    const departments = await Department.find({ isActive: true }).lean();

    // Build date range
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const startStr = startOfMonth.toISOString().split("T")[0];
    const endStr = endOfMonth.toISOString().split("T")[0];

    const workingDays = 26; // Standard working days assumption

    const departmentReports = await Promise.all(
      departments.map(async (dept) => {
        // Get employees in this department
        const employees = await User.find({
          department: dept._id,
          isActive: true,
        }).select("_id");

        const employeeIds = employees.map((e) => e._id.toString());
        const totalEmployees = employees.length;

        if (totalEmployees === 0) {
          return {
            departmentName: (dept as { name: string }).name,
            totalEmployees: 0,
            presentDays: 0,
            absentDays: 0,
            attendanceRate: 0,
          };
        }

        // Get attendance records for all employees in this department
        const attendanceRecords = await Attendance.find({
          userId: { $in: employeeIds },
          date: { $gte: startStr, $lte: endStr },
        }).lean();

        // Calculate totals
        const presentDays = attendanceRecords.filter(
          (r) => r.status === "present" || r.status === "late"
        ).length;
        const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;

        // Expected attendance = employees * working days
        const expectedAttendance = totalEmployees * workingDays;
        const attendanceRate =
          expectedAttendance > 0
            ? Math.round((presentDays / expectedAttendance) * 100)
            : 0;

        return {
          departmentName: (dept as { name: string }).name,
          totalEmployees,
          presentDays,
          absentDays,
          attendanceRate,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: departmentReports,
        meta: { month, year, workingDays },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get department report error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch department report",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
