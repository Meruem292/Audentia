
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { ImagePlaceholder } from "@/lib/placeholder-images";

interface Reward {
  id: string;
  name: string;
  points: number;
  image: ImagePlaceholder;
}

export function RewardsList({ rewards }: { rewards: Reward[] }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setDialogOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedReward) {
      // In a real app, deduct points and update inventory
      toast({
        title: "🎉 Reward Redeemed!",
        description: `You have successfully redeemed "${selectedReward.name}".`,
        variant: 'default',
      });
      setDialogOpen(false);
      setSelectedReward(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
              <div className="aspect-[4/3] relative">
                <Image
                  src={reward.image.imageUrl}
                  alt={reward.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={reward.image.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-base font-bold">{reward.name}</CardTitle>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
              <div className="flex items-center font-bold text-lg text-primary">
                <Star className="w-5 h-5 mr-2 text-accent fill-current" />
                {reward.points.toLocaleString()}
              </div>
              <Button size="sm" onClick={() => handleRedeemClick(reward)}>
                Redeem
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem "{selectedReward?.name}" for{" "}
              {selectedReward?.points.toLocaleString()} points? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRedeem}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
