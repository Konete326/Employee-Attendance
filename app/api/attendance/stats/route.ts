import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    
    // Default to current month (YYYY-MM)
    const now = new Date();
    const currentMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Get today's date in YYYY-MM-DD format
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    
    // Get yesterday's date for trend comparison
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Total employees count
    const totalEmployees = await User.countDocuments({ role: "employee" });

    // Today's attendance stats
    const todayRecords = await Attendance.find({ date: today });
    const presentToday = todayRecords.length;
    const lateToday = todayRecords.filter(r => r.status === "late").length;
    const absentToday = totalEmployees - presentToday;

    // Yesterday's stats for trend
    const yesterdayRecords = await Attendance.find({ date: yesterdayStr });
    const presentYesterday = yesterdayRecords.length;
    const lateYesterday = yesterdayRecords.filter(r => r.status === "late").length;

    // Monthly stats
    const monthStart = `${currentMonth}-01`;
    const [year, month] = currentMonth.split("-").map(Number);
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const monthEnd = `${currentMonth}-${String(lastDayOfMonth).padStart(2, "0")}`;

    const monthRecords = await Attendance.find({
      date: { $gte: monthStart, $lte: monthEnd }
    });

    // Calculate average hours worked
    const recordsWithHours = monthRecords.filter(r => r.hoursWorked > 0);
    const avgHoursThisMonth = recordsWithHours.length > 0
      ? recordsWithHours.reduce((sum, r) => sum + r.hoursWorked, 0) / recordsWithHours.length
      : 0;

    // Total late this month
    const totalLateThisMonth = monthRecords.filter(r => r.status === "late").length;

    // Calculate attendance rate
    // Working days = Monday to Friday in the month (excluding weekends)
    const workingDays = calculateWorkingDays(year, month);
    const expectedAttendance = totalEmployees * workingDays;
    const actualPresent = monthRecords.filter(r => r.status === "present" || r.status === "late").length;
    const attendanceRate = expectedAttendance > 0
      ? (actualPresent / expectedAttendance) * 100
      : 0;

    // Calculate trends
    const presentTrend = presentYesterday > 0
      ? ((presentToday - presentYesterday) / presentYesterday) * 100
      : 0;
    const lateTrend = lateYesterday > 0
      ? ((lateToday - lateYesterday) / lateYesterday) * 100
      : 0;

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: {
          totalEmployees,
          presentToday,
          absentToday,
          lateToday,
          avgHoursThisMonth: Math.round(avgHoursThisMonth * 100) / 100,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          totalLateThisMonth,
          presentTrend: Math.round(presentTrend * 100) / 100,
          lateTrend: Math.round(lateTrend * 100) / 100,
          month: currentMonth,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

function calculateWorkingDays(year: number, month: number): number {
  let workingDays = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
}
