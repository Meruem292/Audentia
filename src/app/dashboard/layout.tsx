
"use client";

import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { userNavItems } from "@/lib/data";
import { useUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { BottomNav } from "@/components/shared/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
            </div>
          </div>
          <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Sidebar>
          <DashboardNav navItems={userNavItems} />
        </Sidebar>
        <SidebarInset>
          <Header title="User Dashboard" />
          <main className="p-4 sm:p-6 lg:p-8 flex-1 animate-fade-in pb-20 md:pb-8">
            {children}
          </main>
        </SidebarInset>
        {isMobile && <BottomNav navItems={userNavItems} />}
      </div>
    </SidebarProvider>
  );
}
