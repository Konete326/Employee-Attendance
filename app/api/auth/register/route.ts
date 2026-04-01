import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if any user exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: "Registration is closed. Contact administrator to create an account.", code: "REGISTRATION_CLOSED" },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create first user as admin
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      employeeId: "EMP-001",
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Admin user registered successfully",
        data: {
          user: {
            id: newUser._id.toString(),
            name: newUser.name,
            role: newUser.role,
          }
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An unexpected error occurred during registration", 
        code: "SERVER_ERROR",
        details: error.name || "UnknownError"
      },
      { status: 500 }
    );
  }
}
