"use client";

import { useEffect, useState } from "react";
import type { MachineVisionData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Image as ImageIcon } from "lucide-react";

interface MachineVisionClientProps {
  initialData: MachineVisionData | null;
}

export default function MachineVisionClient({ initialData }: MachineVisionClientProps) {
  const [visionData, setVisionData] = useState<MachineVisionData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, "machine_vision", "latest"), (doc) => {
      if (doc.exists()) {
        setVisionData(doc.data() as MachineVisionData);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Latest Image</CardTitle>
          <CardDescription>This is the most recent image sent from an ESP32 device.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="aspect-video w-full" />
          ) : visionData?.imageUrl ? (
            <Image
              src={visionData.imageUrl}
              alt="Latest from ESP32"
              width={600}
              height={400}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-md border border-dashed">
              <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No image received yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
          <CardDescription>Gemini's analysis of the latest image.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : visionData?.description ? (
            <p className="text-sm">{visionData.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for analysis...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
