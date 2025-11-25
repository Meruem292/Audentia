
'use client';
import { Button } from "@/components/ui/button";
import { Recycle, Star, Gift, ArrowRight } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {!loading && !userProfile && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
          <div className="grid gap-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              Turn Your Plastic Bottles into Points
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join EcoVend Hub and start earning rewards for recycling. Our smart vending machines make it easy and fun to contribute to a healthier planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://picsum.photos/seed/hero/600/500"
              alt="Happy person recycling a plastic bottle"
              width={600}
              height={500}
              className="rounded-xl shadow-2xl"
              data-ai-hint="person recycling"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-card py-20 md:py-32">
          <div className="container">
            <div className="grid gap-4 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                A simple three-step process to a greener lifestyle and great rewards.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 mt-16 sm:grid-cols-3">
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Recycle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">1. Deposit</h3>
                <p className="text-sm text-muted-foreground">
                  Find an EcoVend machine near you and deposit your empty plastic bottles.
                </p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">2. Earn Points</h3>
                <p className="text-sm text-muted-foreground">
                  For every bottle you recycle, you earn points credited directly to your account.
                </p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold">3. Redeem Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Use your points to redeem exciting rewards from our catalog of sustainable products and vouchers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 md:py-32">
          <div className="grid items-center justify-center gap-4 text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Create your account today and be part of the recycling revolution.
            </p>
            <div className="mt-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Join EcoVend Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} EcoVend Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
