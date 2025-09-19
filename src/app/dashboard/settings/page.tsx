import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
       <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile information.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" disabled />
          </div>
           <div className="space-y-2">
            <Label htmlFor="sixDigitId">Unique ID</Label>
            <Input id="sixDigitId" type="text" placeholder="123456" disabled />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
