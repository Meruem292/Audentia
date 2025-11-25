
import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { adminNavItems } from "@/lib/data";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardNav navItems={adminNavItems} />
      </Sidebar>
      <SidebarInset>
        <Header title="Admin" />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
