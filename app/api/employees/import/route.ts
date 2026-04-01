import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import { ApiResponse } from "@/types";

interface CsvRow {
  name: string;
  email: string;
  password: string;
  department?: string;
  shift?: string;
  salary?: string;
  joiningDate?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// Helper function to generate unique employee ID
async function generateEmployeeId(): Promise<string> {
  const count = await User.countDocuments();
  const nextNumber = count + 1;
  return `EMP-${String(nextNumber).padStart(3, "0")}`;
}

// POST /api/employees/import - Bulk import employees from CSV
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
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const passwordIdx = headers.indexOf("password");
    const deptIdx = headers.indexOf("department");
    const shiftIdx = headers.indexOf("shift");
    const salaryIdx = headers.indexOf("salary");
    const dateIdx = headers.indexOf("joiningdate");

    if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "CSV must have 'name', 'email', and 'password' columns",
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

      const name = values[nameIdx]?.trim();
      const email = values[emailIdx]?.trim().toLowerCase();
      const password = values[passwordIdx]?.trim();
      const department = values[deptIdx]?.trim() || undefined;
      const shift = values[shiftIdx]?.trim() || undefined;
      const salary = values[salaryIdx]?.trim();
      const joiningDate = values[dateIdx]?.trim();

      // Validate row
      if (!name || !email || !password) {
        result.skipped++;
        result.errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        result.skipped++;
        result.errors.push(`Row ${i}: Invalid email format (${email})`);
        continue;
      }

      try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          result.skipped++;
          result.errors.push(`Row ${i}: Email already exists (${email})`);
          continue;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate employee ID
        const employeeId = await generateEmployeeId();

        // Create user
        await User.create({
          name,
          email,
          password: hashedPassword,
          role: "employee",
          employeeId,
          department: department || null,
          shift: shift || null,
          salary: salary ? parseFloat(salary) : 0,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          isActive: true,
          leaveBalance: { annual: 20, sick: 10, casual: 5 },
        });

        result.imported++;
      } catch (err) {
        result.skipped++;
        result.errors.push(`Row ${i}: ${err instanceof Error ? err.message : "Unknown error"}`);
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
    console.error("Import employees error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import employees",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
