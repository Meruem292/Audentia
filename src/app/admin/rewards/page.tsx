
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { RewardManagement } from "@/components/admin/reward-management";

export default function AdminRewardsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reward Management</CardTitle>
                <CardDescription>Manage the reward catalog and inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                <RewardManagement />
            </CardContent>
        </Card>
    );
}
