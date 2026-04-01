import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Notification from "@/models/Notification";
import { ApiResponse } from "@/types";

// POST /api/notifications/create - Create a notification (internal use)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "UserId, title, and message are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || "info",
      link,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET /api/notifications/my - Get user's notifications
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    await connectDB();

    const query: Record<string, unknown> = { userId: user.userId };
    if (unreadOnly) query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: user.userId,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
