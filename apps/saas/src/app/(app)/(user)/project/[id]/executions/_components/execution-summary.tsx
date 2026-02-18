import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";
import { ExternalLinkIcon } from "lucide-react";

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
                    <p className="text-muted-foreground text-sm">Origin</p>
                    <p className="text-sm">
                        {execution.workflowName ? (
                            <>Workflow: {execution.workflowName}</>
                        ) : (
                            <>Trigger: {execution.triggerName ?? "—"}</>
                        )}
                    </p>
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
                {execution.aiSessionId && (
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-sm">
                            Devin session
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={siteUrls.devin.session(
                                    execution.aiSessionId,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Devin
                                <ExternalLinkIcon className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                )}
                {execution.error && (
                    <div className="sm:col-span-2">
                        <p className="text-muted-foreground text-sm">
                            Error message
                        </p>
                        <p className="text-destructive mt-1 text-sm">
                            {execution.error}
                        </p>
                        {execution.error.includes(
                            "concurrent session limit",
                        ) && (
                            <a
                                href={siteUrls.devin.app}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground mt-2 inline-block text-sm underline hover:no-underline"
                            >
                                Open Devin app to manage sessions
                            </a>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
