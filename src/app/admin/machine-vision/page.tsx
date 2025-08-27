import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLatestMachineVisionAction } from "@/lib/actions";
import Image from "next/image";
import MachineVisionClient from "@/components/admin/MachineVisionClient";

export default async function MachineVisionPage() {
  const { data, error } = await getLatestMachineVisionAction();

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Machine Vision</h1>
          <p className="text-muted-foreground">
            See the latest analysis from your recycling machines.
          </p>
        </div>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Machine Vision</h1>
        <p className="text-muted-foreground">
          See the latest analysis from your recycling machines.
        </p>
      </div>
      <MachineVisionClient initialData={data} />
    </div>
  );
}
