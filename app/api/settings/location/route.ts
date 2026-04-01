import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import { ApiResponse, LocationSettingsBody } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/geolocation";

// In-memory cache for settings (in production, use Redis or DB)
let cachedSettings = { ...DEFAULT_SETTINGS };

// GET /api/settings/location - Get current location settings
export async function GET(): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    return NextResponse.json(
      {
        success: true,
        data: cachedSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get location settings error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch settings",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// POST /api/settings/location - Update location settings (admin only)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body: LocationSettingsBody = await request.json();

    // Validate required fields
    if (
      body.officeLat === undefined ||
      body.officeLng === undefined ||
      body.radiusMeters === undefined ||
      body.strictGeofence === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All settings fields are required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (body.officeLat < -90 || body.officeLat > 90) {
      return NextResponse.json(
        {
          success: false,
          error: "Latitude must be between -90 and 90",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (body.officeLng < -180 || body.officeLng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Longitude must be between -180 and 180",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    if (body.radiusMeters < 10 || body.radiusMeters > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: "Radius must be between 10 and 5000 meters",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Update cached settings
    cachedSettings = {
      officeLat: body.officeLat,
      officeLng: body.officeLng,
      radiusMeters: body.radiusMeters,
      strictGeofence: body.strictGeofence,
    };

    return NextResponse.json(
      {
        success: true,
        data: cachedSettings,
        message: "Location settings updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update location settings error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update settings",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
