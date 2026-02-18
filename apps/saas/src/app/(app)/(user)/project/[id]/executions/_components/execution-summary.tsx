import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Execution = Awaited<
    ReturnType<
        typeof import("@/server/actions/relay/queries").getExecutionById
    >
>;

const STATUS_VARIANTS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    completed: "default",
    running: "secondary",
    failed: "destructive",
    pending: "outline",
};

export function ExecutionSummary({
    execution,
}: {
    execution: NonNullable<Execution>;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-muted-foreground text-sm">Status</p>
                    <Badge
                        variant={STATUS_VARIANTS[execution.status] ?? "outline"}
                    >
                        {execution.status}
                    </Badge>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Trigger</p>
                    <p className="text-sm">{execution.triggerName ?? "—"}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Latency</p>
                    <p className="text-sm">
                        {execution.latencyMs != null
                            ? `${execution.latencyMs} ms`
                            : "—"}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Started</p>
                    <p className="text-sm">
                        {execution.startedAt
                            ? new Date(execution.startedAt).toLocaleString()
                            : "—"}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-sm">
                        {execution.completedAt
                            ? new Date(execution.completedAt).toLocaleString()
                            : "—"}
                    </p>
                </div>
                {execution.error && (
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-sm">
                            Error message
                        </p>
                        <p className="text-destructive mt-1 text-sm">
                            {execution.error}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
