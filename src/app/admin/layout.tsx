
"use client";

import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { adminNavItems } from "@/lib/data";
import { useUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== 'admin')) {
      router.push('/login');
    }
  }, [userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background h-16" />
        <div className="flex flex-1">
          <div className="hidden md:block w-64 border-r p-4">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardNav navItems={adminNavItems} />
      </Sidebar>
      <SidebarInset>
        <Header title="Admin" />
        <main className="p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
