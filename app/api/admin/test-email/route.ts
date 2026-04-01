import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware-helpers";
import { sendEmail, emailTemplates } from "@/lib/email";
import { ApiResponse, JWTPayload } from "@/types";

// POST /api/admin/test-email - Send test email to admin
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    // Check admin authorization
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get admin email from request body or use authenticated user's email
    const body = await request.json().catch(() => ({}));
    const adminEmail = body.email || (authResult as unknown as JWTPayload).email;

    if (!adminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "No email address available",
          code: "NO_EMAIL",
        },
        { status: 400 }
      );
    }

    // Send test email
    const template = emailTemplates.welcome("Admin");
    const sent = await sendEmail({
      to: adminEmail,
      subject: `[TEST] ${template.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">AttendEase Email Test</h2>
          <p>This is a test email from your AttendEase system.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          ${template.html}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 12px;">
            If you received this email, your SMTP configuration is working correctly.
          </p>
        </div>
      `,
    });

    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email. Check your SMTP configuration.",
          code: "EMAIL_FAILED",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Test email sent to ${adminEmail}`,
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
