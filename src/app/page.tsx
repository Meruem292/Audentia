
'use client';
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useUser } from "@/lib/firebase";

export default function Home() {
  const { userProfile, loading } = useUser();
  
  const getDashboardLink = () => {
    if (loading) return "/login";
    if (!userProfile) return "/login";
    return userProfile.role === 'admin' ? '/admin' : '/dashboard';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/seed/planet/1920/1080"
        alt="Lush green landscape"
        fill
        className="object-cover z-[-1] opacity-30"
        data-ai-hint="recycling environment"
        priority
      />
      <div className="absolute inset-0 bg-black/50 z-[-1]" />


      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
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
      <main className="flex-1 flex flex-col justify-center animate-fade-in">
        <section className="container text-center">
          <div className="flex flex-col items-center gap-6">
             <div className="p-4 bg-background/50 rounded-full mb-4">
                <Logo />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Welcome to EcoVend Hub
            </h1>
            <p className="max-w-[700px] text-lg text-white/80 md:text-xl">
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
      <footer className="w-full bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-center h-20">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} EcoVend Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
