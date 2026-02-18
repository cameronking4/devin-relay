"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

type DataPoint = { date: string; count: number; label: string };

export function ExecutionActivityChart({
    data,
}: {
    data: { date: string; count: number }[];
}) {
    const chartData: DataPoint[] = data.map((d) => ({
        ...d,
        label: format(parseISO(d.date), "MMM d"),
    }));

    const hasAnyActivity = chartData.some((d) => d.count > 0);
    if (!hasAnyActivity) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Execution activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
                        <p className="text-sm text-muted-foreground">
                            No executions in the last 7 days
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxCount = Math.max(...chartData.map((d) => d.count), 1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    Execution activity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    AI runs over the last 7 days
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 8,
                                right: 8,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="executionGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
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
                                tickFormatter={(v) => String(v)}
                                domain={[0, maxCount]}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload?.[0]) {
                                        const p = payload[0].payload;
                                        return (
                                            <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
                                                <p className="text-xs text-muted-foreground">
                                                    {p.label}
                                                </p>
                                                <p className="font-semibold">
                                                    {p.count} execution
                                                    {p.count !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#executionGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
