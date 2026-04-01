import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER) {
      console.warn("SMTP not configured, email not sent");
      return false;
    }

    await transporter.sendMail({
      from: `"AttendEase" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (error) {
    console.error("Send email error:", error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to AttendEase",
    html: `<h1>Welcome ${name}!</h1><p>Your employee account has been created. You can now log in and start using AttendEase.</p>`,
  }),

  leaveApproved: (name: string, startDate: string, endDate: string) => ({
    subject: "Leave Request Approved",
    html: `<h1>Hello ${name},</h1><p>Your leave request from ${startDate} to ${endDate} has been <strong>approved</strong>.</p>`,
  }),

  leaveRejected: (name: string, startDate: string, endDate: string) => ({
    subject: "Leave Request Rejected",
    html: `<h1>Hello ${name},</h1><p>Your leave request from ${startDate} to ${endDate} has been <strong>rejected</strong>.</p>`,
  }),

  payrollGenerated: (name: string, month: string, year: number, netSalary: number) => ({
    subject: `Payslip for ${month} ${year}`,
    html: `<h1>Hello ${name},</h1><p>Your payslip for ${month} ${year} is ready.</p><p><strong>Net Salary: $${netSalary.toFixed(2)}</strong></p><p>Log in to view details.</p>`,
  }),

  lateCheckIn: (name: string, date: string, checkInTime: string) => ({
    subject: "Late Check-in Notice",
    html: `<h1>Hello ${name},</h1><p>You checked in at ${checkInTime} on ${date}, which is recorded as late.</p>`,
  }),
};
