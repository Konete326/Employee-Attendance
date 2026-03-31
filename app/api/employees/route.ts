import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { ApiResponse } from "@/types";

// GET - Fetch all employees
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
    const search = searchParams.get("search");

    // Build query
    let query: Record<string, unknown> = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Fetch users (exclude password field)
    const users = await User.find(query)
      .select("-password")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    const body = await request.json();
    const { name, email, password, role, department } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "employee",
      department: department || "",
    });

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
    };

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Employee created successfully",
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    const body = await request.json();
    const { id, name, email, role, department, password } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: "Email already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (department !== undefined) user.department = department;

    // Update password if provided
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    // Return updated user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
    };

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Employee updated successfully",
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    // Parse query params or body
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    // If not in query params, try to get from body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Body might be empty, ignore
      }
    }

    if (!id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Delete all attendance records for this user
    await Attendance.deleteMany({ userId: id });

    // Delete user
    await User.findByIdAndDelete(id);

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Employee and associated attendance records deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
