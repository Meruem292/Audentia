
'use client';
import { UserNav } from "@/components/dashboard/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "./logo";
import Link from "next/link";
import { useUser } from "@/lib/firebase";

export function Header({ title }: { title: string }) {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-2 items-center">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:block">
              <Link href="/">
                <Logo />
              </Link>
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block ml-4">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {user && <UserNav />}
          </nav>
        </div>
      </div>
    </header>
  );
}
