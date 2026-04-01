import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { ApiResponse } from "@/types";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// POST /api/attendance/import - Bulk import attendance from CSV
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ImportResult>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV file must have a header row and at least one data row",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const employeeIdIdx = headers.indexOf("employeeid");
    const dateIdx = headers.indexOf("date");
    const checkInIdx = headers.indexOf("checkin");
    const checkOutIdx = headers.indexOf("checkout");
    const statusIdx = headers.indexOf("status");

    if (employeeIdIdx === -1 || dateIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV must have 'employeeId' and 'date' columns",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (!row.trim()) continue;

      // Parse CSV row (handle quoted values)
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of row) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const employeeId = values[employeeIdIdx]?.trim();
      const dateStr = values[dateIdx]?.trim();
      const checkInStr = checkInIdx >= 0 ? values[checkInIdx]?.trim() : null;
      const checkOutStr = checkOutIdx >= 0 ? values[checkOutIdx]?.trim() : null;
      const statusStr = statusIdx >= 0 ? values[statusIdx]?.trim() : "present";

      // Validate row
      if (!employeeId || !dateStr) {
        result.skipped++;
        result.errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        result.skipped++;
        result.errors.push(`Row ${i}: Invalid date format (use YYYY-MM-DD)`);
        continue;
      }

      try {
        // Find user by employeeId
        const user = await User.findOne({ employeeId });
        if (!user) {
          result.skipped++;
          result.errors.push(`Row ${i}: Employee not found (${employeeId})`);
          continue;
        }

        // Check if attendance record already exists
        const existingRecord = await Attendance.findOne({
          userId: user._id,
          date: dateStr,
        });

        if (existingRecord) {
          result.skipped++;
          result.errors.push(`Row ${i}: Attendance already exists for ${employeeId} on ${dateStr}`);
          continue;
        }

        // Parse check-in/check-out times
        let checkIn: Date | null = null;
        let checkOut: Date | null = null;
        let hoursWorked = 0;
        let workingMinutes = 0;

        if (checkInStr) {
          // Parse time (HH:MM format)
          const [hours, minutes] = checkInStr.split(":").map(Number);
          checkIn = new Date(dateStr);
          checkIn.setHours(hours || 0, minutes || 0, 0, 0);
        } else {
          // Default to 9:00 AM if not provided
          checkIn = new Date(dateStr);
          checkIn.setHours(9, 0, 0, 0);
        }

        if (checkOutStr) {
          const [hours, minutes] = checkOutStr.split(":").map(Number);
          checkOut = new Date(dateStr);
          checkOut.setHours(hours || 0, minutes || 0, 0, 0);

          // Calculate hours worked
          const diffMs = checkOut.getTime() - checkIn.getTime();
          workingMinutes = Math.floor(diffMs / (1000 * 60));
          hoursWorked = Number((workingMinutes / 60).toFixed(2));
        }

        // Validate status
        const validStatuses = ["present", "absent", "late", "half-day", "on-leave"];
        const status = validStatuses.includes(statusStr?.toLowerCase())
          ? statusStr.toLowerCase()
          : "present";

        // Create attendance record
        await Attendance.create({
          userId: user._id,
          date: dateStr,
          checkIn,
          checkOut,
          status,
          hoursWorked,
          workingMinutes,
          notes: "Imported via CSV",
        });

        result.imported++;
      } catch (err) {
        result.skipped++;
        result.errors.push(
          `Row ${i}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `Import complete: ${result.imported} imported, ${result.skipped} skipped`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Import attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import attendance",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
