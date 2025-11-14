
"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminTransactionsAction, getAdminUsersAction } from "@/lib/actions";
import { Transaction, UserProfile, UserProfileSerializable } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminAnalytics {
  totalUsers: number;
}


export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfileSerializable[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analytics');
        }
        const result = await response.json();
        setAnalytics(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTransactions() {
        setTransactionsLoading(true);
        const { data, error } = await getAdminTransactionsAction();
        if (error) {
            setTransactionsError(error);
        } else if (data) {
            setTransactions(data);
        }
        setTransactionsLoading(false);
    }
    
    async function fetchUsers() {
      setUsersLoading(true);
      const { data, error } = await getAdminUsersAction();
      if (error) {
        setUsersError(error);
      } else if (data) {
        setUsers(data as UserProfileSerializable[]);
      }
      setUsersLoading(false);
    }

    fetchAnalytics();
    fetchTransactions();
    fetchUsers();
  }, [user]);

  const getTransactionType = (tx: Transaction) => {
    if (tx.pointsEarned && tx.pointsEarned > 0) return { label: 'BOTTLE INSERTION', variant: 'default' } as const;
    if (tx.pointsUsed && tx.pointsUsed > 0) return { label: 'REWARD DISPENSE', variant: 'secondary' } as const;
    return { label: 'SYSTEM', variant: 'outline' } as const;
  }

  const getTransactionDetails = (tx: Transaction) => {
     if (tx.details) return tx.details;
     if (tx.plasticBottleCount) return `Bottles: ${tx.plasticBottleCount}`;
     if (tx.pointsUsed) return `Dispenser: ${tx.dispenserIndex}, Cost: ${tx.pointsUsed} pts`;
     return 'N/A';
  }

  const getPointsChange = (tx: Transaction) => {
    if (tx.pointsEarned && tx.pointsEarned > 0) return tx.pointsEarned;
    if (tx.pointsUsed && tx.pointsUsed > 0) return -tx.pointsUsed;
    return 0;
  }


  return (
    <div className="flex flex-col gap-8">
       <div className="mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your EcoVend system.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardClient initialData={analytics} isLoading={loading} error={error} />
      </div>

       <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">All Users</h2>
        <Card>
            <CardContent className="p-0">
                {usersLoading && <p className="p-4">Loading users...</p>}
                {usersError && <p className="p-4 text-destructive">{usersError}</p>}
                {!usersLoading && !usersError && users.length === 0 && (
                    <p className="p-8 text-center">No users found.</p>
                )}
                {!usersLoading && !usersError && users.length > 0 && (
                 <div className="border-t rounded-lg">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Unique ID</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((userItem) => (
                        <TableRow key={userItem.uid}>
                            <TableCell className="font-medium">{userItem.email}</TableCell>
                            <TableCell>{userItem.sixDigitId}</TableCell>
                            <TableCell>
                                {new Date(userItem.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                                {userItem.points.toLocaleString()}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
       </div>

       <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <Card>
            <CardContent className="p-0">
                {transactionsLoading && <p className="p-4">Loading transactions...</p>}
                {transactionsError && <p className="p-4 text-destructive">{transactionsError}</p>}
                {!transactionsLoading && !transactionsError && transactions.length === 0 && (
                    <p className="p-8 text-center">No transactions found.</p>
                )}
                {!transactionsLoading && !transactionsError && transactions.length > 0 && (
                 <div className="border-t rounded-lg">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => {
                        const type = getTransactionType(tx);
                        const pointsChange = getPointsChange(tx);
                        return (
                        <TableRow key={tx.id}>
                            <TableCell>
                                {new Date(tx.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{tx.userId}</TableCell>
                            <TableCell>
                            <Badge variant={type.variant}>
                                {type.label.replace('_', ' ')}
                            </Badge>
                            </TableCell>
                            <TableCell>{getTransactionDetails(tx)}</TableCell>
                            <TableCell>
                                <Badge variant={tx.status === 'valid' || tx.status === 'dispensed' ? 'default' : 'destructive'}>
                                    {tx.status}
                                </Badge>
                            </TableCell>
                            <TableCell className={cn("text-right font-medium", pointsChange > 0 ? 'text-primary' : 'text-destructive')}>
                                {pointsChange > 0 ? '+' : ''}{pointsChange.toLocaleString()}
                            </TableCell>
                        </TableRow>
                        )})}
                    </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
