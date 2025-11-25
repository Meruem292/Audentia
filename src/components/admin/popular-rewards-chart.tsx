
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useCollection, useFirestore } from '@/lib/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DispenseHistory extends DocumentData {
  dispenserIndex: number;
}

interface Reward extends DocumentData {
  id: string;
  name: string;
  points: number;
}

export function PopularRewardsChart() {
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

    const rewardCounts = new Map<string, number>();

    // Initialize counts for all rewards to 0
    rewards.forEach(reward => {
      rewardCounts.set(reward.name, 0);
    });

    dispenseHistory.forEach(item => {
        // Assuming dispenserIndex is 1-based and corresponds to the order in the rewards collection.
        // This is a fragile assumption. A better approach would be to store the reward ID in the history.
        const reward = rewards[item.dispenserIndex - 1];
        if(reward) {
            rewardCounts.set(reward.name, (rewardCounts.get(reward.name) || 0) + 1);
        }
    });

    return Array.from(rewardCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
  }, [dispenseHistory, rewards]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Rewards</CardTitle>
        <CardDescription>A chart showing the most dispensed rewards.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
            <Skeleton className="w-full h-[350px]" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                width={120}
                tick={{ textAnchor: 'end' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Times Dispensed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No dispense data available.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
