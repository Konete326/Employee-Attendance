import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Payroll from "@/models/Payroll";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Leave from "@/models/Leave";
import { ApiResponse, GeneratePayrollBody } from "@/types";

// Helper to get working days in a month (26 days assumption)
function getWorkingDaysInMonth(year: number, month: number): number {
  // Standard assumption: 26 working days per month
  return 26;
}

// POST /api/payroll/generate - Generate payroll for all employees
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body: GeneratePayrollBody = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json(
        {
          success: false,
          error: "Month and year are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all active employees
    const employees = await User.find({ isActive: true });
    const results = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Check if payroll already exists
        const existing = await Payroll.findOne({
          userId: employee._id,
          month,
          year,
        });

        if (existing) {
          continue; // Skip already generated
        }

        // Get month date range
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        // Get attendance records for this month
        const attendanceRecords = await Attendance.find({
          userId: employee._id,
          date: {
            $gte: startOfMonth.toISOString().split("T")[0],
            $lte: endOfMonth.toISOString().split("T")[0],
          },
        });

        // Count various statuses
        const presentDays = attendanceRecords.filter(
          (r) => r.status === "present"
        ).length;
        const lateDays = attendanceRecords.filter((r) => r.status === "late").length;
        const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;
        const halfDays = attendanceRecords.filter((r) => r.status === "half-day").length;
        const leaveDays = attendanceRecords.filter((r) => r.status === "on-leave").length;

        // Get unpaid leaves for this month
        const unpaidLeaves = await Leave.find({
          userId: employee._id,
          leaveType: "unpaid",
          status: "approved",
          startDate: { $gte: startOfMonth, $lte: endOfMonth },
        });
        const unpaidLeaveDays = unpaidLeaves.reduce(
          (sum, leave) => sum + leave.totalDays,
          0
        );

        // Calculate salary
        const basicSalary = employee.salary || 0;
        const perDaySalary = basicSalary / 26;

        // Deductions
        const absentDeduction = absentDays * perDaySalary;
        // 3 lates = 1 absent
        const lateDeduction = Math.floor(lateDays / 3) * perDaySalary;
        const unpaidLeaveDeduction = unpaidLeaveDays * perDaySalary;

        // Net salary
        const netSalary =
          basicSalary - absentDeduction - lateDeduction - unpaidLeaveDeduction;

        // Create payroll record
        const payroll = await Payroll.create({
          userId: employee._id,
          month,
          year,
          basicSalary,
          presentDays: presentDays + lateDays + halfDays * 0.5,
          absentDays,
          lateDays,
          leaveDays,
          unpaidLeaveDays,
          absentDeduction,
          lateDeduction,
          unpaidLeaveDeduction,
          bonuses: 0,
          netSalary,
          status: "draft",
        });

        results.push(payroll);
      } catch (err) {
        errors.push(
          `${employee.name}: ${err instanceof Error ? err.message : "Error"}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          generated: results.length,
          errors: errors.length > 0 ? errors : undefined,
        },
        message: `Generated payroll for ${results.length} employees`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generate payroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate payroll",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET /api/payroll/all - Get all payroll records (admin)
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");
    const status = searchParams.get("status");

    // Build query
    let query: Record<string, unknown> = {};

    if (month) query.month = month;
    if (year) query.year = year;
    if (status) query.status = status;

    const payrolls = await Payroll.find(query)
      .populate("userId", "name email employeeId")
      .sort({ year: -1, month: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: payrolls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get payroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payroll",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
