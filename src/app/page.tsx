
'use client';
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useUser } from "@/lib/firebase";
import Image from "next/image";

export default function Home() {
  const { userProfile, loading } = useUser();
  
  const getDashboardLink = () => {
    if (loading) return "/login";
    if (!userProfile) return "/login";
    return userProfile.role === 'admin' ? '/admin' : '/dashboard';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {!loading && !userProfile && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
             {!loading && userProfile && (
                <Button asChild>
                  <Link href={getDashboardLink()}>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center text-center text-white">
            <Image
                src="/background.jpg"
                alt="Recycling plastic bottles"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 flex flex-col items-center gap-6 p-4">
                 <div className="mb-4">
                    <Logo className="text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                  Welcome to EcoVend
                </h1>
                <p className="max-w-[700px] text-lg md:text-xl text-white/90">
                  The smart, simple, and stylish way to turn your plastic bottles into rewards. Join us in making our planet greener, one bottle at a time!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Create Account
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link href={getDashboardLink()}>
                      Go to Dashboard <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="container flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EcoVend. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
