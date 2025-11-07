import { getRewardsAction } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift } from "lucide-react";

export default async function RewardsPage() {
  const { data: rewards, error } = await getRewardsAction();

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Available Rewards</h1>
        <p className="text-muted-foreground">
          Use your points to redeem these fantastic rewards!
        </p>
      </div>
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
        <div className="border rounded-lg p-8 text-center">
          <p>No rewards available at the moment. Please check back later.</p>
        </div>
      )}
    </div>
  );
}
