import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Notification from "@/models/Notification";
import { ApiResponse } from "@/types";

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;

    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: "Notification not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: "Notification marked as read",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
