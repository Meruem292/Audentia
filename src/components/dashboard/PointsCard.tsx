"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface PointsCardProps {
  points: number;
}

export default function PointsCard({ points }: PointsCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPoints = useRef(points);

  useEffect(() => {
    if (points > prevPoints.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    prevPoints.current = points;
  }, [points]);

  return (
    <Card className={`transition-shadow duration-1000 ${isAnimating ? 'shadow-lg shadow-primary/50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Points</CardTitle>
        <Star className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div 
          className={`text-2xl font-bold transition-all duration-300 ease-in-out ${isAnimating ? 'text-primary scale-110' : ''}`}
        >
          {points.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground">Keep up the great work!</p>
      </CardContent>
    </Card>
  );
}
