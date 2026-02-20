"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { rerunExecution } from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import {
    ArrowRightIcon,
    ExternalLinkIcon,
    MoreHorizontalIcon,
    RotateCcwIcon,
} from "lucide-react";

type ExecutionRow = Awaited<
    ReturnType<
        typeof import("@/server/actions/relay/queries").getExecutionsByProjectId
    >
>[number];

const STATUS_VARIANTS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    completed: "default",
    running: "secondary",
    failed: "destructive",
    pending: "outline",
};

function formatDuration(ms: number | null | undefined): string {
    if (ms == null) return "—";
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}

function truncateError(err: string | null | undefined, maxLen = 60): string {
    if (!err) return "—";
    if (err.length <= maxLen) return err;
    return err.slice(0, maxLen) + "…";
}

export function ExecutionsTable({
    projectId,
    executions,
}: {
    projectId: string;
    executions: ExecutionRow[];
}) {
    const router = useRouter();
    const [rerunId, setRerunId] = useState<string | null>(null);

    async function handleRerun(executionId: string) {
        setRerunId(executionId);
        try {
            await rerunExecution(projectId, executionId);
            toast.success("Re-run queued");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to re-run",
            );
        } finally {
            setRerunId(null);
        }
    }

    return (
        <TooltipProvider>
            <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Trigger</TableHead>
                            <TableHead>Origin</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Received</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Error</TableHead>
                            <TableHead>Devin</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {executions.map((e) => (
                            <TableRow key={e.id}>
                                <TableCell>
                                    <Badge
                                        variant={
                                            STATUS_VARIANTS[e.status] ??
                                            "outline"
                                        }
                                    >
                                        {e.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <Link
                                            href={siteUrls.relay.trigger(
                                                projectId,
                                                e.triggerId,
                                            )}
                                            className="font-medium hover:underline"
                                        >
                                            {e.triggerName ?? "—"}
                                        </Link>
                                        {e.triggerSource && (
                                            <span className="text-muted-foreground text-xs">
                                                {e.triggerSource}
                                                {e.triggerEventType
                                                    ? ` · ${e.triggerEventType}`
                                                    : ""}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {e.workflowName ? (
                                        <span className="text-muted-foreground text-sm">
                                            Workflow: {e.workflowName}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            Trigger
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {e.eventIds &&
                                    Array.isArray(e.eventIds) &&
                                    e.eventIds.length > 1
                                        ? `${e.eventIds.length} events`
                                        : "1 event"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                    {e.eventReceivedAt
                                        ? new Date(
                                              e.eventReceivedAt,
                                          ).toLocaleString()
                                        : "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                    {e.startedAt
                                        ? new Date(
                                              e.startedAt,
                                          ).toLocaleString()
                                        : e.createdAt
                                          ? new Date(
                                                e.createdAt,
                                            ).toLocaleString()
                                          : "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDuration(e.latencyMs)}
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    {e.status === "failed" && e.error ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="line-clamp-2 cursor-help text-destructive text-xs">
                                                    {truncateError(e.error)}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="left"
                                                className="max-w-sm"
                                            >
                                                {e.error}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">
                                            —
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {e.aiSessionId ? (
                                        <Button variant="ghost" size="sm" asChild>
                                            <a
                                                href={siteUrls.devin.session(
                                                    e.aiSessionId,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View session
                                                <ExternalLinkIcon className="ml-1 h-4 w-4" />
                                            </a>
                                        </Button>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">
                                            —
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label="Open menu"
                                            >
                                                <MoreHorizontalIcon className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={siteUrls.relay.execution(
                                                        projectId,
                                                        e.id,
                                                    )}
                                                >
                                                    <ArrowRightIcon className="mr-2 h-4 w-4" />
                                                    View details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleRerun(e.id)
                                                }
                                                disabled={
                                                    rerunId !== null
                                                }
                                            >
                                                <RotateCcwIcon className="mr-2 h-4 w-4" />
                                                Re-run with same event
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    );
}
