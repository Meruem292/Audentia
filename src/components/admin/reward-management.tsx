
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const rewards = [
  { id: "1", name: "Reusable Coffee Cup", points: 500, stock: 150, image: PlaceHolderImages.find(i => i.id === 'reward-1')! },
  { id: "2", name: "Metal Water Bottle", points: 750, stock: 80, image: PlaceHolderImages.find(i => i.id === 'reward-2')! },
  { id: "3", name: "€10 Cafe Gift Card", points: 1000, stock: 200, image: PlaceHolderImages.find(i => i.id === 'reward-3')! },
  { id: "4", name: "Recycled Tote Bag", points: 400, stock: 300, image: PlaceHolderImages.find(i => i.id === 'reward-4')! },
];

export function RewardManagement() {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Reward
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Reward</TableHead>
                        <TableHead>Points Cost</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rewards.map((reward) => (
                        <TableRow key={reward.id}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={reward.image.imageUrl}
                                        alt={reward.image.description}
                                        width={64}
                                        height={48}
                                        className="rounded-md object-cover"
                                        data-ai-hint={reward.image.imageHint}
                                    />
                                    <span className="font-medium">{reward.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{reward.points.toLocaleString()}</TableCell>
                            <TableCell>{reward.stock.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View redemptions</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
