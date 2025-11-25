
'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Archive, Recycle } from "lucide-react";
import { OverviewChart } from "@/components/admin/overview-chart";
import { useCollection, useFirestore } from "@/lib/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { BottleHistoryTable } from "@/components/admin/bottle-history-table";
import { DispenseHistoryTable } from "@/components/admin/dispense-history-table";
import { PopularRewardsChart } from "@/components/admin/popular-rewards-chart";
import { TransactionStatusChart } from "@/components/admin/transaction-status-chart";

export default function AdminOverviewPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const dispenseHistoryQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "dispense_history"));
  }, [firestore]);

  const bottleHistoryQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, "bottle_history"));
    }, [firestore]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: dispenseHistory, loading: dispenseHistoryLoading } = useCollection(dispenseHistoryQuery);
  const { data: bottleHistory, loading: bottleHistoryLoading } = useCollection(bottleHistoryQuery);

  const loading = usersLoading || dispenseHistoryLoading || bottleHistoryLoading;

  const totalBottlesRecycled = useMemo(() => {
    if (!bottleHistory) return 0;
    return bottleHistory.reduce((total, item) => total + (item.plasticBottleCount || 0), 0);
  }, [bottleHistory]);
  
  const totalPointsRedeemed = useMemo(() => {
    if (!dispenseHistory) return 0;
    return dispenseHistory.reduce((total, item) => total + (item.pointsUsed || 0), 0);
  }, [dispenseHistory]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#E0F7FA] border-[#B2EBF2]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#E8F5E9] border-[#C8E6C9]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Redeemed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#FFFDE7] border-[#FFF9C4]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Dispensed</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dispenseHistory?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total rewards dispensed</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#FCE4EC] border-[#F8BBD0]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottles Recycled</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalBottlesRecycled.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total bottles recycled to date</p>
                </>
              )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <OverviewChart />
        <PopularRewardsChart />
        <TransactionStatusChart />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <BottleHistoryTable />
        <DispenseHistoryTable />
      </div>
    </div>
  );
}
