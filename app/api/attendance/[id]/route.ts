import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import { ApiResponse, AttendanceOverrideBody, JWTPayload } from "@/types";

// PUT /api/attendance/[id] - Admin override attendance status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;

    const { id } = await params;
    const body: AttendanceOverrideBody = await request.json();

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Store old values for audit (before update)
    const oldStatus = attendance.status;

    // Update record
    attendance.status = body.status;
    if (body.notes) {
      attendance.notes = attendance.notes
        ? `${attendance.notes} | Admin: ${body.notes}`
        : `Admin: ${body.notes}`;
    }
    attendance.overriddenBy = user.userId;
    attendance.overriddenAt = new Date();

    await attendance.save();

    // Return updated record with populated user
    const updated = await Attendance.findById(id)
      .populate("userId", "name email")
      .populate("overriddenBy", "name")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: `Attendance status updated from "${oldStatus}" to "${body.status}"`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Attendance override error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update attendance",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET /api/attendance/[id] - Get single attendance record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    await connectDB();

    const attendance = await Attendance.findById(id)
      .populate("userId", "name email employeeId")
      .populate("overriddenBy", "name")
      .lean();

    if (!attendance) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance record not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: attendance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch attendance",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
