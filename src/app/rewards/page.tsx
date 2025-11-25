
'use client';
import { useCollection, useFirestore, useUser } from '@/lib/firebase';
import { collection, doc, DocumentData, runTransaction } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Reward extends DocumentData {
  id: string;
  name: string;
  points: number;
}

export default function RewardsPage() {
  const firestore = useFirestore();
  const { userProfile } = useUser();
  const rewardsQuery = firestore ? collection(firestore, 'rewards') : null;
  const { data: rewards, loading } = useCollection<Reward>(rewardsQuery);
  const { toast } = useToast();

  const handleRedeem = async (reward: Reward) => {
    if (!firestore || !userProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to redeem rewards.",
      });
      return;
    }
    
    if (userProfile.points < reward.points) {
      toast({
        variant: "destructive",
        title: "Not enough points",
        description: `You need ${reward.points - userProfile.points} more points to redeem this reward.`,
      });
      return;
    }

    const userRef = doc(firestore, 'users', userProfile.uid);

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "User document does not exist!";
        }
        
        const newPoints = userDoc.data().points - reward.points;
        if (newPoints < 0) {
            throw "Not enough points.";
        }
        transaction.update(userRef, { points: newPoints });

        const dispenseHistoryRef = doc(collection(firestore, 'dispense_history'));
        transaction.set(dispenseHistoryRef, {
            userId: userProfile.sixDigitId,
            rewardId: reward.id,
            rewardName: reward.name,
            pointsUsed: reward.points,
            timestamp: new Date(),
            status: 'valid' // assuming it's always valid from the app
        });
      });

      toast({
        title: "Reward Redeemed!",
        description: `You have successfully redeemed ${reward.name}.`,
      });

    } catch (e) {
      console.error("Redemption failed: ", e);
      toast({
        variant: "destructive",
        title: "Redemption Failed",
        description: "There was an error processing your request. Please try again.",
      });
    }
  };
  
  const getImageForReward = (rewardId: string) => {
    return PlaceHolderImages.find(img => img.id === `reward-${rewardId.split('-')[1]}`)?.imageUrl || 'https://picsum.photos/seed/default/400/300';
  }


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Rewards Catalog</h1>
        <p className="text-muted-foreground">
            Use your points to redeem awesome rewards! You have {userProfile?.points?.toLocaleString() || 0} points.
        </p>
      </div>
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards?.map((reward) => (
            <Card key={reward.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={getImageForReward(reward.id)}
                    alt={reward.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <CardTitle>{reward.name}</CardTitle>
                <p className="text-lg font-semibold text-primary">{reward.points.toLocaleString()} points</p>
              </CardContent>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={!userProfile || userProfile.points < reward.points}>
                        {userProfile && userProfile.points < reward.points ? 'Not Enough Points' : 'Redeem'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to spend {reward.points.toLocaleString()} points to redeem {reward.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRedeem(reward)}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
