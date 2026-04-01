import { EmployeeSidebar } from "@/components/layout/employee-sidebar";
import { Header } from "@/components/layout/header";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent relative z-10">
      <EmployeeSidebar />
      <div className="flex-1 lg:ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
