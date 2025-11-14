
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import type { UserProfile, Reward } from "@/lib/types";
import { getMotivationalMessageAction, getRewardsAction, sendPasswordResetEmailAction } from "@/lib/actions";
import PointsCard from "./PointsCard";
import IdCard from "./IdCard";
import MotivationalMessage from "./MotivationalMessage";
import { Skeleton } from "@/components/ui/skeleton";
import type { GenerateMotivationalMessageOutput } from "@/ai/flows/generate-motivational-message";
import { Button } from "../ui/button";
import { RefreshCw, Gift, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState<GenerateMotivationalMessageOutput | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);
  const { toast } = useToast();

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
             fetchMessage(profileData.points);
          }
        } else {
          console.error("No such document in Firestore!");
        }
        setProfileLoading(false);
      });
      return () => unsub();
    }
  }, [user, userProfile]);

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

  useEffect(() => {
    async function fetchRewards() {
      setRewardsLoading(true);
      const { data, error } = await getRewardsAction();
      if (error) {
        setRewardsError(error);
      } else if (data) {
        setRewards(data);
      }
      setRewardsLoading(false);
    }

    fetchRewards();
  }, []);
  
  const handleChangePassword = async () => {
    if (!userProfile?.email) return;

    setIsPasswordResetLoading(true);
    const result = await sendPasswordResetEmailAction(userProfile.email);
    setIsPasswordResetLoading(false);

    if (result.success) {
      toast({
        title: "Check your email",
        description: `A password reset link has been sent to ${userProfile.email}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };


  if (loading || profileLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  if (!userProfile) {
    return <p>Could not load user profile. Please try again later.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
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

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Rewards</h2>
          {rewardsLoading && <p>Loading rewards...</p>}
          {rewardsError && <p className="text-destructive">{rewardsError}</p>}
          {rewards && rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                      <Gift className="h-8 w-8 text-primary mb-4" />
                    <CardTitle>{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-primary">
                      {reward.points.toLocaleString()} Points
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !rewardsLoading && <div className="border rounded-lg p-8 text-center">
              <p>No rewards available at the moment. Please check back later.</p>
            </div>
          )}
        </div>

        <div>
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <Card>
                <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userProfile.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sixDigitId">Unique ID</Label>
                    <Input id="sixDigitId" type="text" value={userProfile.sixDigitId} disabled />
                </div>
                 <Button onClick={handleChangePassword} disabled={isPasswordResetLoading}>
                    {isPasswordResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
