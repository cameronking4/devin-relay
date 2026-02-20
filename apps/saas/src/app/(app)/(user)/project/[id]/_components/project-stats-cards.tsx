import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LayersIcon, ZapIcon, ClockIcon } from "lucide-react";

export function ProjectStatsCards({
    triggerCount,
    executionsToday,
    lastExecution,
}: {
    triggerCount: number;
    executionsToday: number;
    lastExecution: Date | null;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Triggers
                    </CardTitle>
                    <LayersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tabular-nums">
                        {triggerCount.toLocaleString()}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Webhook triggers
                    </p>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Executions today
                    </CardTitle>
                    <ZapIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tabular-nums">
                        {executionsToday.toLocaleString()}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        AI runs in last 24h
                    </p>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Last execution
                    </CardTitle>
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tabular-nums">
                        {lastExecution
                            ? new Date(lastExecution).toLocaleString()
                            : "—"}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Most recent run
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
