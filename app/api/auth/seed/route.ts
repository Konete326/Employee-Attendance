import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Connect to database
    await connectDB();

    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Admin user already exists. Seeding not required.",
        },
        { status: 409 }
      );
    }

    // Create default admin user
    const adminPassword = "admin123";
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = await User.create({
      name: "Admin",
      email: "admin@attendance.com",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        message: "Default admin user created successfully",
        data: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          department: adminUser.department,
          createdAt: adminUser.createdAt,
          note: "Default password is 'admin123'. Please change it after first login.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
