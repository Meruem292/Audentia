"use client";

import { useState } from "react";
import type { Reward } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateRewardAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

interface RewardsClientProps {
  initialRewards: Reward[];
}

export default function RewardsClient({ initialRewards }: RewardsClientProps) {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [editingReward, setEditingReward] = useState<Omit<Reward, 'imageUrl'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEdit = (reward: Reward) => {
    const { imageUrl, ...editableReward } = reward;
    setEditingReward({ ...editableReward });
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
      setRewards(rewards.map((r) => (r.id === editingReward.id ? { ...r, ...editingReward } : r)));
      setEditingReward(null);
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingReward) return;
    const { name, value } = e.target;
    setEditingReward({
      ...editingReward,
      [name]: name === "points" ? Number(value) : value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map((reward) => (
        <Card key={reward.id}>
          <CardContent className="space-y-4 pt-6">
            {editingReward?.id === reward.id ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" name="name" value={editingReward.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input id="points" name="points" type="number" value={editingReward.points} onChange={handleChange} />
                </div>
              </>
            ) : (
              <>
                <CardTitle>{reward.name}</CardTitle>
                <p className="text-lg font-semibold text-primary">{reward.points.toLocaleString()} Points</p>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {editingReward?.id === reward.id ? (
              <>
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => handleEdit(reward)}>Edit</Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
