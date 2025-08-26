"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, KeyRound } from "lucide-react";
import { getAdminAnalyticsAction } from "@/lib/actions";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "../ui/skeleton";

interface AdminAnalytics {
  totalUsers: number;
}

export default function AdminDashboardClient() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
          throw new Error('Failed to fetch analytics');
        }
        
        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }
        
        setAnalytics(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);
  
  const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </>
        ) : (
            <>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and system settings.</p>
      </div>
       {error && <p className="text-destructive">Error: {error}</p>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
            title="Total Users" 
            value={analytics?.totalUsers ?? 0} 
            icon={Users} 
            description="All registered users in the system."
            isLoading={loading}
        />
        <StatCard 
            title="Machines Online" 
            value={56} 
            icon={Bot} 
            description="2 actively recycling"
            isLoading={loading}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Key</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono bg-muted p-2 rounded">REVENDO-XXXX-XXXX-XXXX</div>
            <p className="text-xs text-muted-foreground">
              Use this key for partner machines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
