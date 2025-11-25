
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Recycle, Gift } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface BottleTransaction extends DocumentData {
  id: string;
  timestamp: Timestamp;
  type: 'Deposit';
  plasticBottleCount: number;
  pointsEarned: number;
}

interface DispenseTransaction extends DocumentData {
  id: string;
  timestamp: Timestamp;
  type: 'Redemption';
  pointsUsed: number;
}

type CombinedTransaction = (BottleTransaction | DispenseTransaction) & { sortDate: Date };


export default function DashboardPage() {
  const { userProfile, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const userId = userProfile?.sixDigitId;

  const bottleHistoryQuery = useMemo(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'bottle_history'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, userId]);

  const dispenseHistoryQuery = useMemo(() => {
    if (!firestore || !userId) return null;
    return query(
      collection(firestore, 'dispense_history'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, userId]);

  const { data: bottleHistory, loading: bottleHistoryLoading } = useCollection(bottleHistoryQuery);
  const { data: dispenseHistory, loading: dispenseHistoryLoading } = useCollection(dispenseHistoryQuery);

  const loading = userLoading || bottleHistoryLoading || dispenseHistoryLoading;

  const totalBottlesRecycled = useMemo(() => {
    if (!bottleHistory) return 0;
    return bottleHistory.reduce((sum, item) => sum + (item.plasticBottleCount || 0), 0);
  }, [bottleHistory]);

  const recentTransactions = useMemo(() => {
    const combined: CombinedTransaction[] = [];

    if (bottleHistory) {
      bottleHistory.forEach(item =>
        combined.push({
          ...item,
          type: 'Deposit',
          sortDate: item.timestamp.toDate(),
        })
      );
    }
    if (dispenseHistory) {
      dispenseHistory.forEach(item =>
        combined.push({
          ...item,
          type: 'Redemption',
          sortDate: item.timestamp.toDate(),
        })
      );
    }
    
    return combined.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 10);
  }, [bottleHistory, dispenseHistory]);

  const lastDepositPoints = useMemo(() => {
      if (bottleHistory && bottleHistory.length > 0) {
          const lastDeposit = bottleHistory[0]; // Already sorted by desc timestamp
          return lastDeposit.pointsEarned;
      }
      return 0;
  }, [bottleHistory]);

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#E8F5E9] border-[#C8E6C9]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {userProfile?.points?.toLocaleString() || 0}
                </div>
                 {lastDepositPoints > 0 && (
                    <p className="text-xs text-muted-foreground">
                        +{lastDepositPoints} points from your last deposit
                    </p>
                 )}
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#FCE4EC] border-[#F8BBD0]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bottles Recycled
            </CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                <Skeleton className="h-8 w-16" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{totalBottlesRecycled}</div>
                    <p className="text-xs text-muted-foreground">
                    Keep up the great work!
                    </p>
                </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                A log of your recent deposits and redemptions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bottles</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.sortDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          txn.type === 'Deposit' ? 'default' : 'destructive'
                        }
                      >
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(txn as BottleTransaction).plasticBottleCount || '-'}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        txn.type === 'Deposit'
                          ? 'text-primary'
                          : 'text-destructive'
                      }`}
                    >
                      {txn.type === 'Deposit'
                        ? `+${(txn as BottleTransaction).pointsEarned}`
                        : `-${(txn as DispenseTransaction).pointsUsed}`}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No transactions found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
