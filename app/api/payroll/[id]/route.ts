import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Payroll from "@/models/Payroll";
import { ApiResponse, UpdatePayrollBody } from "@/types";

// PUT /api/payroll/[id] - Update payroll (edit bonuses only in draft)
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

    const { id } = await params;
    const body: UpdatePayrollBody = await request.json();

    await connectDB();

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return NextResponse.json(
        {
          success: false,
          error: "Payroll not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (payroll.status !== "draft") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot edit finalized payroll",
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    // Update bonuses
    if (body.bonuses !== undefined) {
      payroll.bonuses = body.bonuses;
      // Recalculate net salary
      payroll.netSalary =
        payroll.basicSalary -
        payroll.absentDeduction -
        payroll.lateDeduction -
        payroll.unpaidLeaveDeduction +
        body.bonuses;
    }

    await payroll.save();

    const updated = await Payroll.findById(id)
      .populate("userId", "name email employeeId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Payroll updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update payroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payroll",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// PUT /api/payroll/[id]/finalize - Finalize payroll
export async function PATCH(
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

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return NextResponse.json(
        {
          success: false,
          error: "Payroll not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (payroll.status === "finalized") {
      return NextResponse.json(
        {
          success: false,
          error: "Payroll already finalized",
          code: "ALREADY_FINALIZED",
        },
        { status: 400 }
      );
    }

    payroll.status = "finalized";
    payroll.finalizedAt = new Date();
    await payroll.save();

    const updated = await Payroll.findById(id)
      .populate("userId", "name email employeeId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Payroll finalized successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Finalize payroll error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to finalize payroll",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
