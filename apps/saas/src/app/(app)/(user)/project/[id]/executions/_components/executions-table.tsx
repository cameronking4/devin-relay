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
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";

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

export function ExecutionsTable({
    projectId,
    executions,
}: {
    projectId: string;
    executions: ExecutionRow[];
}) {
    return (
        <div className="rounded-md border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Latency</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Devin</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {executions.map((e) => (
                        <TableRow key={e.id}>
                            <TableCell>
                                <Badge
                                    variant={
                                        STATUS_VARIANTS[e.status] ?? "outline"
                                    }
                                >
                                    {e.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {e.workflowName
                                    ? `Workflow: ${e.workflowName}`
                                    : e.triggerName ?? "—"}
                            </TableCell>
                            <TableCell>
                                {e.latencyMs != null
                                    ? `${e.latencyMs} ms`
                                    : "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {e.startedAt
                                    ? new Date(e.startedAt).toLocaleString()
                                    : e.createdAt
                                      ? new Date(e.createdAt).toLocaleString()
                                      : "—"}
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
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={siteUrls.relay.execution(
                                            projectId,
                                            e.id,
                                        )}
                                    >
                                        View
                                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
