
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[calc(100vh-theme(spacing.14))] flex items-center justify-center text-white">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/seed/forest/1920/1080"
        fill
        alt="A misty forest background"
        className="object-cover -z-10 brightness-50"
        priority
        data-ai-hint="forest mist"
      />

      {/* Content */}
      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
              Smart Vending for a Greener Future
            </h1>
            <p className="max-w-[700px] mx-auto text-gray-200 md:text-xl">
              EcoVend helps you optimize your vending machine business while promoting environmental sustainability.
            </p>
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Access Your Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
