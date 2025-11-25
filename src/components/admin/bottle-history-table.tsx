
'use client';

import * as React from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';


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

function BottleHistoryRow({ item, user }: { item: BottleHistory, user: UserProfile | undefined }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
            <TableBody>
                <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback>{user?.email ? user.email.charAt(0).toUpperCase() : <User />}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user?.name || user?.email || 'Unknown User'}</div>
                            {user?.name && user?.email && (
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.plasticBottleCount}</TableCell>
                    <TableCell className="font-medium text-primary hidden md:table-cell">+{item.pointsEarned}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={item.status === 'valid' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right md:hidden">
                       <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                                <span className="sr-only">{isOpen ? "Collapse" : "Expand"}</span>
                            </Button>
                        </CollapsibleTrigger>
                    </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                    <TableRow>
                        <TableCell colSpan={4} className="pt-0">
                           <div className="p-4 space-y-4 bg-muted/50 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Bottles</span>
                                    <span>{item.plasticBottleCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Points</span>
                                    <span className="font-medium text-primary">+{item.pointsEarned}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-muted-foreground">Status</span>
                                    <Badge variant={item.status === 'valid' ? 'default' : 'destructive'}>
                                        {item.status}
                                    </Badge>
                                </div>
                           </div>
                        </TableCell>
                    </TableRow>
                </CollapsibleContent>
            </TableBody>
        </Collapsible>
    )
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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Bottles</TableHead>
              <TableHead className="hidden md:table-cell">Points</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="md:hidden"><span className="sr-only">Expand</span></TableHead>
            </TableRow>
          </TableHeader>
            {loading ? (
                <TableBody>
              {[...Array(5)].map((_, i) => (
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
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="md:hidden"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
                </TableBody>
            ) : history && history.length > 0 ? (
              history.map((item) => {
                const user = usersMap.get(item.userId);
                return (
                  <BottleHistoryRow key={item.id} item={item} user={user} />
                );
              })
            ) : (
             <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No bottle insertion history found.
                </TableCell>
              </TableRow>
             </TableBody>
            )}
        </Table>
      </CardContent>
    </Card>
  );
}
