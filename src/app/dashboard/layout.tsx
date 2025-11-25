
import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { userNavItems } from "@/lib/data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardNav navItems={userNavItems} />
      </Sidebar>
      <SidebarInset>
        <Header title="User Dashboard" />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
