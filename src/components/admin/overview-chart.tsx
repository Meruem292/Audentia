
"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { useCollection, useFirestore } from '@/lib/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface DispenseHistory extends DocumentData {
  dispenserIndex: number;
  pointsUsed: number;
}

interface Reward extends DocumentData {
  id: string;
  name: string;
}

export function OverviewChart() {
    const firestore = useFirestore();

    const dispenseHistoryQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'dispense_history'));
      }, [firestore]);
    
      const rewardsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'rewards'));
      }, [firestore]);

    const { data: dispenseHistory, loading: historyLoading } = useCollection<DispenseHistory>(dispenseHistoryQuery);
    const { data: rewards, loading: rewardsLoading } = useCollection<Reward>(rewardsQuery);

    const loading = historyLoading || rewardsLoading;

    const chartData = useMemo(() => {
        if (!dispenseHistory || !rewards) {
          return [];
        }
    
        const rewardPoints = new Map<string, number>();
    
        rewards.forEach(reward => {
          rewardPoints.set(reward.name, 0);
        });
    
        dispenseHistory.forEach(item => {
            // Assuming dispenserIndex is 1-based and corresponds to the order in the rewards collection.
            const reward = rewards[item.dispenserIndex - 1];
            if(reward) {
                rewardPoints.set(reward.name, (rewardPoints.get(reward.name) || 0) + item.pointsUsed);
            }
        });
    
        return Array.from(rewardPoints.entries())
          .map(([name, totalPoints]) => ({ name, totalPoints }))
          .sort((a, b) => b.totalPoints - a.totalPoints);

      }, [dispenseHistory, rewards]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Total Points Redeemed per Reward</CardTitle>
                <CardDescription>Total points spent on each reward item.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                 {loading ? (
                    <Skeleton className="w-full h-[350px]" />
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value as number) / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{ 
                                    background: 'hsl(var(--background))', 
                                    border: '1px solid hsl(var(--border))', 
                                    borderRadius: 'var(--radius)' 
                                }}
                                 formatter={(value: number) => [value.toLocaleString(), 'Total Points']}
                            />
                            <Bar dataKey="totalPoints" fill="hsl(var(--chart-1))" name="Total Points Redeemed" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        No data available to display.
                    </div>
                )}
            </CardContent>
      </Card>
    )
}
