import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Shift from "@/models/Shift";
import { ApiResponse, CreateShiftBody, IShift } from "@/types";

// PUT /api/shifts/[id] - Update shift (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<IShift>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    const { id } = await params;
    const body: Partial<CreateShiftBody> = await request.json();

    await connectDB();

    // Find shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          error: "Shift not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name.trim() !== shift.name) {
      const existingShift = await Shift.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        _id: { $ne: id },
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
    }

    // Update fields
    if (body.name !== undefined) shift.name = body.name.trim();
    if (body.startTime !== undefined) shift.startTime = body.startTime;
    if (body.endTime !== undefined) shift.endTime = body.endTime;
    if (body.workingHours !== undefined) shift.workingHours = body.workingHours;
    if (body.lateThresholdMinutes !== undefined)
      shift.lateThresholdMinutes = body.lateThresholdMinutes;

    await shift.save();

    return NextResponse.json(
      {
        success: true,
        data: shift,
        message: "Shift updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update shift error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update shift",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/shifts/[id] - Soft delete shift (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    const { id } = await params;

    await connectDB();

    // Find shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          error: "Shift not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Soft delete
    shift.isActive = false;
    await shift.save();

    return NextResponse.json(
      {
        success: true,
        message: "Shift deleted successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete shift error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete shift",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
