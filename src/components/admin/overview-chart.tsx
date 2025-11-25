
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const chartData = [
  { name: "Jan", total: 4200 },
  { name: "Feb", total: 3100 },
  { name: "Mar", total: 5500 },
  { name: "Apr", total: 4800 },
  { name: "May", total: 6200 },
  { name: "Jun", total: 5900 },
  { name: "Jul", total: 7100 },
  { name: "Aug", total: 6800 },
  { name: "Sep", total: 7500 },
  { name: "Oct", total: 8100 },
  { name: "Nov", total: 8500 },
  { name: "Dec", total: 9200 },
];

export function OverviewChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bottles Recycled Overview</CardTitle>
                <CardDescription>Monthly totals for the current year.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value as number) / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{ 
                                background: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: 'var(--radius)' 
                            }}
                        />
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
      </Card>
    )
}
