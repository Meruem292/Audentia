import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
