
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { verifyUser } from "@/lib/auth-user";
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyUser();

  if (user.role === 'admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
