"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { getMotivationalMessageAction } from "@/lib/actions";
import PointsCard from "./PointsCard";
import IdCard from "./IdCard";
import MotivationalMessage from "./MotivationalMessage";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateMotivationalMessageOutput } from "@/ai/flows/generate-motivational-message";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState<GenerateMotivationalMessageOutput | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          const profileData = doc.data() as UserProfile;
          setUserProfile(profileData);
          if (userProfile && profileData.points > userProfile.points) {
             // Points increased, fetch new message
             fetchMessage(profileData.points);
          }
        } else {
          // Handle case where user exists in Auth but not Firestore
          console.error("No such document in Firestore!");
        }
        setProfileLoading(false);
      });
      return () => unsub();
    }
  }, [user]);
  
  const fetchMessage = async (points: number) => {
    setMessageLoading(true);
    const result = await getMotivationalMessageAction(points);
    if(result.success && result.data){
        setMessage(result.data);
    }
    setMessageLoading(false);
  }

  useEffect(() => {
    if(userProfile && !message){
        fetchMessage(userProfile.points)
    }
  }, [userProfile, message])


  if (loading || profileLoading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <p>Could not load user profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's your recycling dashboard.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PointsCard points={userProfile.points} />
        <IdCard id={userProfile.sixDigitId} />
        <MotivationalMessage messageData={message} isLoading={messageLoading} />
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => fetchMessage(userProfile.points)} disabled={messageLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${messageLoading ? 'animate-spin' : ''}`} />
          New Message
        </Button>
      </div>
    </div>
  );
}
