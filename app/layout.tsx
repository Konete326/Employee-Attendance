import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/neu-toast";
import { AnimatedBackground } from "@/components/ui/animated-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AttendEase — Employee Attendance System",
  description:
    "Role-based employee attendance tracking system with check-in/check-out, admin dashboard, and detailed reports.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { SidebarProvider } from "@/lib/SidebarContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <AnimatedBackground />
        <SidebarProvider>
          <ToastProvider>{children}</ToastProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
