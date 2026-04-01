import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/middleware-helpers";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ApiResponse } from "@/types";

// GET /api/export/attendance?month=1&year=2025&dept=deptId&format=excel|pdf
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<unknown> | Buffer>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if ("error" in authResult) {
      return authResult as NextResponse<ApiResponse<never>>;
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1 + "");
    const year = parseInt(searchParams.get("year") || new Date().getFullYear() + "");
    const deptId = searchParams.get("dept");
    const format = searchParams.get("format") || "excel";

    await connectDB();

    // Build date range
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Build user query
    let userQuery: Record<string, unknown> = { isActive: true };
    if (deptId) {
      userQuery.department = deptId;
    }

    // Get users
    const users = await User.find(userQuery)
      .select("_id name employeeId department")
      .populate("department", "name")
      .lean();

    const userIds = users.map((u) => u._id.toString());

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      userId: { $in: userIds },
      date: {
        $gte: startOfMonth.toISOString().split("T")[0],
        $lte: endOfMonth.toISOString().split("T")[0],
      },
    }).lean();

    // Create a map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
      const key = `${record.userId.toString()}_${record.date}`;
      attendanceMap.set(key, record);
    });

    // Prepare data rows
    const rows: Array<{
      "Employee Name": string;
      "Employee ID": string;
      Department: string;
      Date: string;
      "Check-in": string;
      "Check-out": string;
      Status: string;
      "Working Hours": number | string;
    }> = [];

    for (const user of users) {
      for (let d = 1; d <= endOfMonth.getDate(); d++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const record = attendanceMap.get(`${user._id.toString()}_${dateStr}`);

        rows.push({
          "Employee Name": (user as unknown as { name: string }).name,
          "Employee ID": (user as unknown as { employeeId?: string }).employeeId || "N/A",
          Department: (user as unknown as { department?: { name?: string } }).department?.name || "N/A",
          Date: dateStr,
          "Check-in": record?.checkIn
            ? new Date(record.checkIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : "-",
          "Check-out": record?.checkOut
            ? new Date(record.checkOut).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : "-",
          Status: record?.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : "Absent",
          "Working Hours": record?.hoursWorked ? record.hoursWorked.toFixed(2) : "0.00",
        });
      }
    }

    const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });
    const dateToday = new Date().toISOString().split("T")[0];

    if (format === "excel") {
      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Employee ID
        { wch: 15 }, // Department
        { wch: 12 }, // Date
        { wch: 12 }, // Check-in
        { wch: 12 }, // Check-out
        { wch: 12 }, // Status
        { wch: 15 }, // Working Hours
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      // Generate buffer
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="attendance-${monthName.toLowerCase()}-${year}-${dateToday}.xlsx"`,
        },
      });
    } else if (format === "pdf") {
      // Create PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.text(`Attendance Report - ${monthName} ${year}`, 14, 20);

      // Table
      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [["Employee Name", "Employee ID", "Department", "Date", "Check-in", "Check-out", "Status", "Hours"]],
        body: rows.map((r) => [
          r["Employee Name"],
          r["Employee ID"],
          r.Department,
          r.Date,
          r["Check-in"],
          r["Check-out"],
          r.Status,
          r["Working Hours"],
        ]),
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 95] },
      });

      // Footer
      const pageCount = (doc as jsPDF & { internal: { pages: { length: number } } }).internal.pages.length;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Generated on ${dateToday}`, 14, doc.internal.pageSize.height - 10);
      }

      const pdfBuffer = doc.output("arraybuffer");

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="attendance-${monthName.toLowerCase()}-${year}-${dateToday}.pdf"`,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid format. Use 'excel' or 'pdf'",
          code: "INVALID_FORMAT",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export attendance",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
