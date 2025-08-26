import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

interface IdCardProps {
  id: string;
}

export default function IdCard({ id }: IdCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Unique ID</CardTitle>
        <KeyRound className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-widest">{id}</div>
        <p className="text-xs text-muted-foreground">
          Enter this ID on a partner machine to earn points.
        </p>
      </CardContent>
    </Card>
  );
}
