import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Payroll from "@/models/Payroll";
import { ApiResponse } from "@/types";

// GET /api/payroll/my - Get employee's own payslips
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    // Build query
    let query: Record<string, unknown> = { userId: user.userId };

    if (month) query.month = month;
    if (year) query.year = year;

    const payrolls = await Payroll.find(query)
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
    console.error("Get my payroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payslips",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
