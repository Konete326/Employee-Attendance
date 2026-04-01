import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Shift from "@/models/Shift";
import { ApiResponse, CreateShiftBody, IShift } from "@/types";

// GET /api/shifts - Get all active shifts
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IShift[]>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query = includeInactive ? {} : { isActive: true };
    const shifts = await Shift.find(query).sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        data: shifts,
        message: "Shifts fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get shifts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shifts",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// POST /api/shifts - Create new shift (admin only)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IShift>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    const body: CreateShiftBody = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Shift name is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (!body.startTime || !body.endTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Start time and end time are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (!body.workingHours || body.workingHours <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Working hours must be greater than 0",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate name
    const existingShift = await Shift.findOne({
      name: { $regex: new RegExp(`^${body.name}$`, "i") },
    });

    if (existingShift) {
      return NextResponse.json(
        {
          success: false,
          error: "Shift with this name already exists",
          code: "DUPLICATE_ERROR",
        },
        { status: 409 }
      );
    }

    // Create shift
    const shift = await Shift.create({
      name: body.name.trim(),
      startTime: body.startTime,
      endTime: body.endTime,
      workingHours: body.workingHours,
      lateThresholdMinutes: body.lateThresholdMinutes || 15,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: shift,
        message: "Shift created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create shift error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create shift",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
