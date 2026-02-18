import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
        <div className="grid gap-4 sm:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Triggers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{triggerCount}</span>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Executions today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{executionsToday}</span>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Last execution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">
                        {lastExecution
                            ? new Date(lastExecution).toLocaleString()
                            : "—"}
                    </span>
                </CardContent>
            </Card>
        </div>
    );
}
