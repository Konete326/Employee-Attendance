import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<never>>> {
  try {
    // Delete the token cookie
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return NextResponse.json<ApiResponse<never>>(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
