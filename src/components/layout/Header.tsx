
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push("/");
  };

  const logoHref = user ? "/dashboard" : "/";

  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      );
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Open user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  };
  
   const renderMobileAuth = () => {
    if (loading) {
      return <Skeleton className="h-10 w-full" />;
    }
    if (user) {
      return (
        <div className="flex flex-col gap-4">
            <Button variant="outline" onClick={() => { router.push('/dashboard'); setIsSheetOpen(false); }}>Dashboard</Button>
            <Button variant="ghost" onClick={() => { handleSignOut(); setIsSheetOpen(false); }}>Logout</Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
         <Button variant="outline" asChild onClick={() => setIsSheetOpen(false)}><Link href="/login">Sign In</Link></Button>
         <Button asChild onClick={() => setIsSheetOpen(false)}>
            <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link href={logoHref} className="flex items-center gap-2">
            <Image src="/audentiaLogo.png" alt="EcoVend Logo" width={32} height={32} />
            <span className="font-bold">EcoVend</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center justify-end gap-4">
          {renderAuthButtons()}
        </div>

        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-6">
                  <div className="flex flex-col h-full">
                      <div className="mb-8">
                        <Link href={logoHref} className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                            <Image src="/audentiaLogo.png" alt="EcoVend Logo" width={32} height={32} />
                            <span className="font-bold">EcoVend</span>
                        </Link>
                      </div>
                      <div className="flex flex-col gap-4">
                        {renderMobileAuth()}
                      </div>
                  </div>
                </SheetContent>
            </Sheet>
        </div>

      </div>
    </header>
  );
}
