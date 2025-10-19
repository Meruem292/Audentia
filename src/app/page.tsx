
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { UserProfile } from "@/lib/types";

import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            if (userProfile.role === 'admin') {
              router.replace("/admin/dashboard");
            } else {
              router.replace("/dashboard");
            }
          } else {
            // Fallback for new users, profile might not be created yet
            router.replace("/dashboard");
          }
        } catch (error) {
            console.error("Error fetching user document:", error);
            // Fallback redirection
            router.replace("/dashboard");
        }
      }
    };

    if (!loading) {
      checkUserAndRedirect();
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
        <div className="flex flex-col gap-8 container py-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </div>
  );
}
