
import AdminSidebar from "@/components/admin/AdminSidebar";
import { verifyAdmin } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  try {
    await verifyAdmin();
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      // This is an expected redirect, so we re-throw it to let Next.js handle it.
      throw error;
    }
    // For other errors, you might want to log them or redirect to a generic error page.
    console.error("Error in admin layout:", error);
    redirect('/login');
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
