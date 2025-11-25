
'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Users, Archive, Recycle } from "lucide-react";
import { OverviewChart } from "@/components/admin/overview-chart";
import { useCollection, useFirestore } from "@/lib/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { BottleHistoryTable } from "@/components/admin/bottle-history-table";
import { DispenseHistoryTable } from "@/components/admin/dispense-history-table";

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-muted-foreground">4 offline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y_0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
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
        <Card>
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
      <OverviewChart />
      <div className="grid gap-6 lg:grid-cols-2">
        <BottleHistoryTable />
        <DispenseHistoryTable />
      </div>
    </div>
  );
}
