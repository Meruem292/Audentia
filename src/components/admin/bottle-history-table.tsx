
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/lib/firebase';
import { collection, query, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface BottleHistory extends DocumentData {
  id: string;
  plasticBottleCount: number;
  pointsEarned: number;
  status: 'valid' | 'invalid';
  timestamp: Timestamp;
  userId: string; // This is the sixDigitId
}

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    sixDigitId: string;
}

export function BottleHistoryTable() {
  const firestore = useFirestore();

  const historyQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bottle_history'), orderBy('timestamp', 'desc'));
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: history, loading: historyLoading } = useCollection<BottleHistory>(historyQuery);
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const usersMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(user => [user.sixDigitId, user]));
  }, [users]);
  
  const loading = historyLoading || usersLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bottle Insertion History</CardTitle>
        <CardDescription>A log of all bottle deposits from all users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Bottles</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : history && history.length > 0 ? (
              history.map((item) => {
                const user = usersMap.get(item.userId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/40/40`} data-ai-hint="person face" />
                            <AvatarFallback>{user?.name ? user.name.charAt(0) : <User />}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user?.name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.plasticBottleCount}</TableCell>
                    <TableCell className="font-medium text-primary">+{item.pointsEarned}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'valid' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.timestamp.toDate().toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No bottle insertion history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
