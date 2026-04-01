import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/middleware-helpers";
import Payroll from "@/models/Payroll";
import User from "@/models/User";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ApiResponse } from "@/types";

// GET /api/export/payslip/[userId]?month=1&year=2025
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<ApiResponse<unknown> | Buffer>> {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) {
      return user;
    }

    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1 + "");
    const year = parseInt(searchParams.get("year") || new Date().getFullYear() + "");

    // Check if user is requesting their own payslip or is admin
    const isAdmin = user.role === "admin";
    if (userId !== user.userId && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only download your own payslip",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Get employee details
    const employee = await User.findById(userId).select("name employeeId").lean();
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Get payroll record
    const payroll = await Payroll.findOne({
      userId,
      month,
      year,
    }).lean();

    if (!payroll) {
      return NextResponse.json(
        {
          success: false,
          error: "Payslip not found for this month",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const monthName = new Date(year, month - 1).toLocaleString("en-US", { month: "long" });

    // Create PDF
    const doc = new jsPDF() as any; // Cast to any to access autoTable plugin properties

    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 95);
    doc.text("AttendEase", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Employee Payslip", 14, 30);

    // Payslip Details Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 40, 180, 35, "F");

    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    const empName = (employee as any).name || "Employee";
    const empId = (employee as any).employeeId || "N/A";

    doc.text(`Employee Name: ${empName}`, 20, 50);
    doc.text(`Employee ID: ${empId}`, 20, 58);
    doc.text(`Period: ${monthName} ${year}`, 20, 66);

    doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 120, 50);
    doc.text(`Status: ${(payroll.status || "unpaid").toUpperCase()}`, 120, 58);

    // Earnings Table
    const earningsData = [
      ["Basic Salary", `$${(payroll.basicSalary || 0).toFixed(2)}`],
      ["Present Days", (payroll.presentDays || 0).toString()],
      ["Bonuses", `$${(payroll.bonuses || 0).toFixed(2)}`],
    ];

    doc.autoTable({
      startY: 85,
      head: [["Description", "Amount"]],
      body: earningsData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
    });

    // Deductions Table
    const deductionsData = [
      ["Absent Deduction", `$${(payroll.absentDeduction || 0).toFixed(2)}`],
      ["Late Deduction", `$${(payroll.lateDeduction || 0).toFixed(2)}`],
      ["Unpaid Leave Deduction", `$${(payroll.unpaidLeaveDeduction || 0).toFixed(2)}`],
    ];

    const finalY = (doc as any).lastAutoTable?.finalY || 110;

    doc.autoTable({
      startY: finalY + 10,
      head: [["Deduction", "Amount"]],
      body: deductionsData,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 10 },
    });

    // Net Salary Box
    const netY = (doc as any).lastAutoTable?.finalY || 150;

    doc.setFillColor(30, 58, 95);
    doc.rect(14, netY + 15, 180, 20, "F");

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Net Salary: $${(payroll.netSalary || 0).toFixed(2)}`, 20, netY + 28);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated payslip and does not require a signature.", 14, doc.internal.pageSize.height - 20);
    doc.text("For queries, please contact HR department.", 14, doc.internal.pageSize.height - 15);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payslip-${empId}-${monthName.toLowerCase()}-${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export payslip error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to export payslip",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
