"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminAnalytics {
  totalUsers: number;
}


export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchAnalytics();
  }, [user]);

  return (
    <div className="flex flex-col gap-8">
       <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your EcoVend system.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardClient initialData={analytics} isLoading={loading} error={error} />
      </div>
    </div>
  );
}
