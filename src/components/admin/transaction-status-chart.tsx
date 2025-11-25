
'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCollection, useFirestore } from '@/lib/firebase';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BottleHistory extends DocumentData {
  status: 'valid' | 'invalid';
}

const COLORS = {
  valid: 'hsl(var(--chart-1))',
  invalid: 'hsl(var(--chart-4))',
};

export function TransactionStatusChart() {
  const firestore = useFirestore();

  const bottleHistoryQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bottle_history'));
  }, [firestore]);

  const { data: bottleHistory, loading } = useCollection<BottleHistory>(bottleHistoryQuery);

  const chartData = useMemo(() => {
    if (!bottleHistory) {
      return [];
    }

    const statusCounts = bottleHistory.reduce(
      (acc, item) => {
        if (item.status === 'valid') {
          acc.valid += 1;
        } else if (item.status === 'invalid') {
          acc.invalid += 1;
        }
        return acc;
      },
      { valid: 0, invalid: 0 }
    );

    return [
      { name: 'Valid', value: statusCounts.valid },
      { name: 'Invalid', value: statusCounts.invalid },
    ];
  }, [bottleHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
        <CardDescription>Breakdown of valid and invalid bottle deposits.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[350px]" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No transaction data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
