import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import { ApiResponse } from "@/types";

interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  date: string;
  checkIn: Date;
  checkOut: Date | null;
  status: "present" | "absent" | "late";
  hoursWorked: number;
  notes: string;
}

interface AttendanceResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AttendanceResponse>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const query: Record<string, unknown> = {};

    if (user.role === "employee") {
      query.userId = user.userId;
    }

    if (month) {
      const startDate = `${month}-01`;
      const [year, monthNum] = month.split("-").map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${month}-${lastDay.toString().padStart(2, "0")}`;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email department"),
      Attendance.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<ApiResponse<AttendanceResponse>>(
      {
        success: true,
        data: {
          records: records as unknown as AttendanceRecord[],
          total,
          page,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch attendance error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
