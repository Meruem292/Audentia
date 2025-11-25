
"use client";

import { Header } from "@/components/shared/header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sidebar";
import { userNavItems } from "@/lib/data";
import { useUser } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
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

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <DashboardNav navItems={userNavItems} />
            </SheetContent>
          </Sheet>
        </Header>
        <main className="p-4 sm:p-6 lg:p-8 flex-1 pb-20 animate-fade-in">
          {children}
        </main>
        <BottomNav navItems={userNavItems} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <DashboardNav navItems={userNavItems} />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <Header>
             <h1 className="text-xl font-bold tracking-tight ml-4">User Dashboard</h1>
          </Header>
          <main className="p-4 sm:p-6 lg:p-8 flex-1 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
