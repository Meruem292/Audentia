
"use client";

import { useState } from "react";
import type { Reward } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateRewardAction, deleteRewardAction } from "@/lib/actions";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RewardsClientProps {
  initialRewards: Reward[];
}

export default function RewardsClient({ initialRewards }: RewardsClientProps) {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEdit = (reward: Reward) => {
    setEditingReward({ ...reward });
  };

  const handleCancel = () => {
    setEditingReward(null);
  };

  const handleSave = async () => {
    if (!editingReward) return;
    setIsLoading(true);

    const result = await updateRewardAction(editingReward);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "Reward Updated",
        description: `Successfully updated ${editingReward.name}.`,
      });
      setRewards(
        rewards.map((r) =>
          r.id === editingReward.id ? { ...r, ...editingReward } : r
        )
      );
      setEditingReward(null);
    }
    setIsLoading(false);
  };
  
  const handleDelete = async (rewardId: string) => {
    setIsDeleting(rewardId);
    const result = await deleteRewardAction(rewardId);
    if(result.error) {
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: result.error,
        });
    } else {
        toast({
            title: "Reward Deleted",
            description: `Successfully deleted reward.`,
        });
        setRewards(rewards.filter(r => r.id !== rewardId));
    }
    setIsDeleting(null);
  }

  const handleEditingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingReward) return;
    const { name, value } = e.target;
    setEditingReward({
      ...editingReward,
      [name]: name === "points" ? Number(value) : value,
    });
  };

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold mb-4">Existing Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
                <Card key={reward.id}>
                <CardContent className="space-y-4 pt-6">
                    {editingReward?.id === reward.id ? (
                    <>
                        <div className="space-y-2">
                        <Label htmlFor={`name-${reward.id}`}>Item Name</Label>
                        <Input
                            id={`name-${reward.id}`}
                            name="name"
                            value={editingReward.name}
                            onChange={handleEditingChange}
                        />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor={`points-${reward.id}`}>Points</Label>
                        <Input
                            id={`points-${reward.id}`}
                            name="points"
                            type="number"
                            value={editingReward.points}
                            onChange={handleEditingChange}
                        />
                        </div>
                    </>
                    ) : (
                    <>
                        <CardTitle>{reward.name}</CardTitle>
                        <p className="text-lg font-semibold text-primary">
                        {reward.points.toLocaleString()} Points
                        </p>
                    </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {editingReward?.id === reward.id ? (
                    <>
                        <Button variant="ghost" onClick={handleCancel}>
                        Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save
                        </Button>
                    </>
                    ) : (
                    <>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isDeleting === reward.id}>
                                    {isDeleting === reward.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the reward
                                    &quot;{reward.name}&quot;.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(reward.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" onClick={() => handleEdit(reward)}>
                            Edit
                        </Button>
                    </>
                    )}
                </CardFooter>
                </Card>
            ))}
            </div>
      </div>
    </div>
  );
}
