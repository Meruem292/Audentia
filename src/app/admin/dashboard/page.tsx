import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminAnalyticsAction } from "@/lib/actions";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalyticsAction();

  return (
    <div className="flex flex-col gap-8">
       <div className="mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your EcoVend system.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardClient initialData={analytics.data} />
      </div>
    </div>
  );
}
