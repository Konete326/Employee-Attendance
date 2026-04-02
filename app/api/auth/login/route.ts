import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password", code: "AUTH_ERROR" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is inactive", code: "ACCOUNT_INACTIVE" },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password", code: "AUTH_ERROR" },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("rbeas_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
          },
          token,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
