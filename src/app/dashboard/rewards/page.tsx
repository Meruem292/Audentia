
import { RewardsList } from "@/components/dashboard/rewards-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const rewards = [
  { id: "1", name: "Reusable Coffee Cup", points: 500, image: PlaceHolderImages.find(i => i.id === 'reward-1')! },
  { id: "2", name: "Metal Water Bottle", points: 750, image: PlaceHolderImages.find(i => i.id === 'reward-2')! },
  { id: "3", name: "€10 Cafe Gift Card", points: 1000, image: PlaceHolderImages.find(i => i.id === 'reward-3')! },
  { id: "4", name: "Recycled Tote Bag", points: 400, image: PlaceHolderImages.find(i => i.id === 'reward-4')! },
  { id: "5", name: "Bamboo Straws Pack", points: 250, image: PlaceHolderImages.find(i => i.id === 'reward-5')! },
  { id: "6", name: "20% Discount Voucher", points: 1200, image: PlaceHolderImages.find(i => i.id === 'reward-6')! },
];

export default function RewardsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards Catalog</CardTitle>
        <CardDescription>
          Use your points to redeem amazing rewards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RewardsList rewards={rewards} />
      </CardContent>
    </Card>
  );
}
