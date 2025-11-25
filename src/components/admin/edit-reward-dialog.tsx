
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFirestore } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { DocumentData } from 'firebase/firestore';

interface Reward extends DocumentData {
    id: string;
    name: string;
    points: number;
}

interface EditRewardDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reward: Reward;
}

const rewardSchema = z.object({
  name: z.string().min(1, "Reward name is required"),
  points: z.coerce.number().int().min(0, "Points must be a positive number"),
});

type RewardFormData = z.infer<typeof rewardSchema>;

export function EditRewardDialog({ isOpen, onOpenChange, reward }: EditRewardDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: reward.name,
      points: reward.points,
    },
  });

  useEffect(() => {
    if (reward) {
      reset({
        name: reward.name,
        points: reward.points,
      });
    }
  }, [reward, reset]);

  const onSubmit = async (data: RewardFormData) => {
    if (!firestore || !reward?.id) return;
    setLoading(true);

    try {
      const rewardRef = doc(firestore, 'rewards', reward.id);
      await updateDoc(rewardRef, {
        name: data.name,
        points: data.points,
      });

      toast({
        title: "Success",
        description: "Reward updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating reward:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update reward.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>
              Make changes to the reward details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="name" {...field} />}
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <div className="col-span-3">
                <Controller
                  name="points"
                  control={control}
                  render={({ field }) => <Input id="points" type="number" {...field} />}
                />
                {errors.points && <p className="text-destructive text-sm mt-1">{errors.points.message}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
