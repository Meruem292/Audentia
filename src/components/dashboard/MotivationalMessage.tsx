"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Play, Loader2, StopCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import type { GenerateMotivationalMessageOutput } from "@/ai/flows/generate-motivational-message";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface MotivationalMessageProps {
  messageData: GenerateMotivationalMessageOutput | null;
  isLoading: boolean;
}

export default function MotivationalMessage({ messageData, isLoading }: MotivationalMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (messageData?.audioUri) {
      const audio = new Audio(messageData.audioUri);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    }
  }, [messageData]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </>
      );
    }
    if (messageData) {
      return (
        <div className="flex items-start justify-between">
            <blockquote className="text-sm italic">“{messageData.message}”</blockquote>
            {messageData.audioUri && (
                <Button variant="ghost" size="icon" onClick={handlePlayPause} className="ml-2 flex-shrink-0">
                    {isPlaying ? <StopCircle className="h-5 w-5"/> : <Play className="h-5 w-5" />}
                    <span className="sr-only">Play message</span>
                </Button>
            )}
        </div>
      );
    }
    return <p className="text-sm text-muted-foreground">No message available.</p>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Eco-Friendly Tip</CardTitle>
        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 min-h-[40px]">
         {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}
