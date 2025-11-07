import RewardsClient from "@/components/admin/RewardsClient";
import { getAdminRewardsAction } from "@/lib/actions";

export default async function RewardsPage() {
  const { data: rewards, error } = await getAdminRewardsAction();

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configure Rewards</h1>
        <p className="text-muted-foreground">
          Update the items and points for the reward dispenser.
        </p>
      </div>
      <RewardsClient initialRewards={rewards || []} />
    </div>
  );
}
