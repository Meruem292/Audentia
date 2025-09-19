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
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Menu, Recycle, User } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  const logoHref = user ? "/dashboard" : "/";

  const renderAuthButtons = () => {
    if (loading) {
      return <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />;
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
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
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
        <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-lg" onClick={() => setIsSheetOpen(false)}>Dashboard</Link>
            <Link href="/dashboard/settings" className="text-lg" onClick={() => setIsSheetOpen(false)}>Settings</Link>
            <Button onClick={() => { handleSignOut(); setIsSheetOpen(false); }}>Logout</Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
         <Button variant="ghost" asChild onClick={() => setIsSheetOpen(false)}><Link href="/login">Login</Link></Button>
         <Button asChild onClick={() => setIsSheetOpen(false)}><Link href="/signup">Sign Up</Link></Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href={logoHref} className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="font-bold">EcoVend</span>
          </Link>
        </div>
        {!user && (
           <nav className="hidden items-center gap-4 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:flex">{renderAuthButtons()}</div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation links and authentication options.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <Link href={logoHref} className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                  <Recycle className="h-6 w-6 text-primary" />
                  <span className="font-bold">EcoVend</span>
                </Link>
                {!user && (
                    <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg"
                        onClick={() => setIsSheetOpen(false)}
                        >
                        {link.label}
                        </Link>
                    ))}
                    </div>
                )}
                <div className="mt-auto flex flex-col gap-2">{renderMobileAuth()}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
