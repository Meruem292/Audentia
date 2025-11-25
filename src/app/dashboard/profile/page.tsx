
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ProfileForm } from "@/components/dashboard/profile-form";

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile & Security</CardTitle>
        <CardDescription>View your personal information and update your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm />
      </CardContent>
    </Card>
  )
}
