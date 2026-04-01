import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Department from "@/models/Department";
import { ApiResponse, CreateDepartmentBody, IDepartment } from "@/types";

// GET /api/departments - Get all active departments
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IDepartment[]>>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query = includeInactive ? {} : { isActive: true };
    const departments = await Department.find(query)
      .populate("managerId", "name email")
      .sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        data: departments,
        message: "Departments fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch departments",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create new department (admin only)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<IDepartment>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    const body: CreateDepartmentBody = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Department name is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate name
    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${body.name}$`, "i") },
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

    // Create department
    const department = await Department.create({
      name: body.name.trim(),
      description: body.description?.trim() || "",
      managerId: body.managerId || null,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: "Department created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create department",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
