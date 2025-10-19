"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface AdminAnalytics {
  totalUsers: number;
}

interface AdminDashboardClientProps {
    initialData: AdminAnalytics | null;
}

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This can be used for real-time updates if needed in the future
    // For now, we rely on the server-fetched initialData
    if (initialData) {
        setAnalytics(initialData);
        setLoading(false);
    }
  }, [initialData]);

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
  
  if (error) return <p className="text-destructive col-span-full">Error: {error}</p>;

  return (
    <StatCard 
        title="Total Users" 
        value={analytics?.totalUsers ?? 0} 
        icon={Users} 
        description="All registered users in the system."
        isLoading={loading}
    />
  );
}
