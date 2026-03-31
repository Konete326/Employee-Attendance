import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getAuthUser } from "@/lib/middleware-helpers";
import User from "@/models/User";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Get authenticated user from token
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by ID (exclude password)
    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json<ApiResponse<unknown>>(
      {
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
