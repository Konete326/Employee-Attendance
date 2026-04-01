import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Department from "@/models/Department";
import { ApiResponse, CreateDepartmentBody, IDepartment } from "@/types";

// PUT /api/departments/[id] - Update department (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<IDepartment>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body: Partial<CreateDepartmentBody> = await request.json();

    await connectDB();

    // Find department
    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name.trim() !== department.name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingDepartment) {
        return NextResponse.json(
          {
            success: false,
            error: "Department with this name already exists",
            code: "DUPLICATE_ERROR",
          },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (body.name !== undefined) department.name = body.name.trim();
    if (body.description !== undefined)
      department.description = body.description.trim();
    if (body.managerId !== undefined) department.managerId = body.managerId || null;

    await department.save();

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: "Department updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update department",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] - Soft delete department (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;

    await connectDB();

    // Find department
    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Soft delete
    department.isActive = false;
    await department.save();

    return NextResponse.json(
      {
        success: true,
        message: "Department deleted successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete department",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
