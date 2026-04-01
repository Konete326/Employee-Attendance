import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Department from "@/models/Department";
import Shift from "@/models/Shift";
import mongoose from "mongoose";
import { ApiResponse, CreateEmployeeBody } from "@/types";

// Helper function to generate unique employee ID
async function generateEmployeeId(): Promise<string> {
  const count = await User.countDocuments();
  const nextNumber = count + 1;
  return `EMP-${String(nextNumber).padStart(3, "0")}`;
}

// GET - Fetch all employees with pagination and filters
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
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    let query: Record<string, unknown> = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
        ],
      };
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.isActive = status === "active";
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch users with pagination (exclude password field)
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .populate("department", "name")
        .populate("shift", "name startTime endTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get employees error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "SERVER_ERROR",
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

    const body: CreateEmployeeBody = await request.json();
    const { name, email, password, department, shift, salary, joiningDate } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Name, email, and password are required",
          code: "VALIDATION_ERROR",
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
          code: "DUPLICATE_ERROR",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    // Process department - if it's a name, find or create the document
    let finalDepartmentId = null;
    if (department) {
      if (mongoose.Types.ObjectId.isValid(department)) {
        finalDepartmentId = department;
      } else {
        const deptDoc = await Department.findOne({ name: department.trim() });
        if (deptDoc) {
          finalDepartmentId = deptDoc._id;
        } else {
          const newDept = await Department.create({ name: department.trim() });
          finalDepartmentId = newDept._id;
        }
      }
    }

    // Process shift - if it's a name, find or create the document
    let finalShiftId = null;
    if (shift) {
      if (mongoose.Types.ObjectId.isValid(shift)) {
        finalShiftId = shift;
      } else {
        const shiftDoc = await Shift.findOne({ name: { $regex: new RegExp(`^${shift.trim()}$`, 'i') } });
        if (shiftDoc) {
          finalShiftId = shiftDoc._id;
        } else {
          // Create default shift if not found by name
          const newShift = await Shift.create({ 
            name: shift.trim(),
            startTime: "09:00",
            endTime: "17:00",
            workingHours: 8
          });
          finalShiftId = newShift._id;
        }
      }
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "employee",
      employeeId,
      department: finalDepartmentId,
      shift: finalShiftId,
      salary: salary || 0,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      isActive: true,
      leaveBalance: { annual: 20, sick: 10, casual: 5 },
    });

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("department", "name")
      .populate("shift", "name startTime endTime")
      .lean();

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Employee created successfully",
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "SERVER_ERROR",
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
    const { id, name, email, role, department, shift, salary, joiningDate, password, isActive } = body;

    if (!id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Employee ID is required",
          code: "VALIDATION_ERROR",
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
          code: "NOT_FOUND",
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
            code: "DUPLICATE_ERROR",
          },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    
    // Process department update
    if (department !== undefined) {
      if (!department) {
        user.department = null;
      } else if (mongoose.Types.ObjectId.isValid(department)) {
        user.department = department;
      } else {
        const deptDoc = await Department.findOne({ name: department.trim() });
        if (deptDoc) {
          user.department = deptDoc._id;
        } else {
          const newDept = await Department.create({ name: department.trim() });
          user.department = newDept._id;
        }
      }
    }

    // Process shift update
    if (shift !== undefined) {
      if (!shift) {
        user.shift = null;
      } else if (mongoose.Types.ObjectId.isValid(shift)) {
        user.shift = shift;
      } else {
        const shiftDoc = await Shift.findOne({ name: { $regex: new RegExp(`^${shift.trim()}$`, 'i') } });
        if (shiftDoc) {
          user.shift = shiftDoc._id;
        } else {
          const newShift = await Shift.create({ 
            name: shift.trim(),
            startTime: "09:00",
            endTime: "17:00",
            workingHours: 8
          });
          user.shift = newShift._id;
        }
      }
    }
    if (salary !== undefined) user.salary = salary;
    if (joiningDate) user.joiningDate = new Date(joiningDate);
    if (isActive !== undefined) user.isActive = isActive;

    // Update password if provided
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    // Return updated user without password
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate("department", "name")
      .populate("shift", "name startTime endTime")
      .lean();

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Employee updated successfully",
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete employee
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
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
          code: "VALIDATION_ERROR",
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
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        message: "Employee deactivated successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
