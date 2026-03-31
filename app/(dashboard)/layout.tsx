"use client";

import NeuralBackground from "@/components/ui/flow-field-background";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--neu-bg)" }}
    >
      <NeuralBackground
        className="fixed inset-0 z-0"
        color="#818cf8"
        trailOpacity={0.1}
        speed={0.5}
        particleCount={400}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-20 pb-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
