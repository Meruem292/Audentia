
'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore } from "@/lib/firebase";
import { collection, query, DocumentData } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { EditRewardDialog } from './edit-reward-dialog';

interface Reward extends DocumentData {
  id: string;
  name: string;
  points: number;
  imageUrl: string;
}

export function RewardManagement() {
    const firestore = useFirestore();
    const rewardsQuery = firestore ? query(collection(firestore, "rewards")) : null;
    const { data: rewards, loading, error } = useCollection<Reward>(rewardsQuery);
    
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

    const handleEditClick = (reward: Reward) => {
        setSelectedReward(reward);
        setIsEditDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Reward</TableHead>
                            <TableHead>Points Cost</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(4)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-16 w-16 rounded-md" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    if (error) {
        return <div>Error loading rewards. Please try again.</div>
    }

    if (!rewards || rewards.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No rewards found.</div>
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reward</TableHead>
                        <TableHead>Points Cost</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rewards.map((reward) => (
                        <TableRow key={reward.id}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={reward.imageUrl}
                                        alt={reward.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover"
                                    />
                                    <span className="font-medium">{reward.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{reward.points.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditClick(reward)}>
                                            Edit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {selectedReward && (
                 <EditRewardDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    reward={selectedReward}
                 />
            )}
        </div>
    );
}
