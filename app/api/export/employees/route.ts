import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import User from "@/models/User";
import * as XLSX from "xlsx";
import { ApiResponse } from "@/types";

// GET /api/export/employees?format=excel
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown> | Buffer>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "excel";

    if (format !== "excel") {
      return NextResponse.json(
        {
          success: false,
          error: "Only Excel format is supported for employees export",
          code: "INVALID_FORMAT",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all active employees
    const employees = await User.find({ isActive: true })
      .select("employeeId name email department shift salary joiningDate isActive")
      .populate("department", "name")
      .populate("shift", "name")
      .sort({ name: 1 })
      .lean();

    // Prepare data rows
    const rows = employees.map((emp) => ({
      "Employee ID": emp.employeeId || "N/A",
      Name: emp.name,
      Email: emp.email,
      Department: (emp as unknown as { department?: { name?: string } }).department?.name || "N/A",
      Shift: (emp as unknown as { shift?: { name?: string } }).shift?.name || "N/A",
      Salary: emp.salary || 0,
      "Joining Date": emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString("en-US")
        : "N/A",
      Status: emp.isActive ? "Active" : "Inactive",
    }));

    const dateToday = new Date().toISOString().split("T")[0];

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Department
      { wch: 15 }, // Shift
      { wch: 12 }, // Salary
      { wch: 15 }, // Joining Date
      { wch: 12 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="employees-export-${dateToday}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export employees error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export employees",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
