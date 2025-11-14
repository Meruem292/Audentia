
import AdminSidebar from "@/components/admin/AdminSidebar";
import { verifyAdmin } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await verifyAdmin();
  if (result.error) {
    redirect(result.redirect);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/40 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
