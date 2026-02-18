"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getDevinSessionsForOrg } from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
    BotIcon,
    ExternalLinkIcon,
    FilterIcon,
    Loader2Icon,
    SparklesIcon,
} from "lucide-react";

type DevinSession = Awaited<
    ReturnType<typeof getDevinSessionsForOrg>
>[number];

type Project = { id: string; name: string };

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "running", label: "Running" },
    { value: "pending", label: "Pending" },
] as const;

const STATUS_VARIANTS: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    completed: "default",
    running: "secondary",
    failed: "destructive",
    pending: "outline",
};

export function DevinSessionsSheet({
    open,
    onOpenChange,
    projects,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projects: Project[];
}) {
    const [sessions, setSessions] = useState<DevinSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [projectFilter, setProjectFilter] = useState<string>("all");

    useEffect(() => {
        if (open) {
            setLoading(true);
            getDevinSessionsForOrg({ limit: 100 })
                .then(setSessions)
                .finally(() => setLoading(false));
        }
    }, [open]);

    const filteredSessions = sessions.filter((s) => {
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        if (projectFilter !== "all" && s.projectId !== projectFilter)
            return false;
        return true;
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-[50vw] min-w-[320px] max-w-[50vw] flex-col p-0"
            >
                <SheetHeader className="border-b border-border px-6 py-5">
                    <SheetTitle className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-primary" />
                        Devin Sessions
                    </SheetTitle>
                    <SheetDescription>
                        AI sessions from your Relay executions. Open in Devin to
                        view the full conversation.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <FilterIcon className="h-4 w-4" />
                        <span>Filter</span>
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                >
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={projectFilter}
                        onValueChange={setProjectFilter}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All projects</SelectItem>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-3 px-6 pb-6 pt-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Loader2Icon className="text-muted-foreground mb-4 h-10 w-10 animate-spin" />
                                <p className="text-muted-foreground text-sm">
                                    Loading sessions…
                                </p>
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BotIcon className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
                                <p className="text-muted-foreground mb-1 font-medium">
                                    No Devin sessions yet
                                </p>
                                <p className="text-muted-foreground max-w-[260px] text-sm">
                                    Sessions appear here when your triggers run
                                    and Devin completes a task.
                                </p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => (
                                <SessionCard key={session.id} session={session} />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

function SessionCard({ session }: { session: DevinSession }) {
    const sessionId = session.aiSessionId;
    if (!sessionId) return null;

    return (
        <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={
                                    STATUS_VARIANTS[session.status] ?? "outline"
                                }
                                className="shrink-0"
                            >
                                {session.status}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="text-muted-foreground max-w-[140px] truncate font-normal"
                            >
                                {session.projectName}
                            </Badge>
                            <span className="text-muted-foreground truncate text-xs">
                                {session.triggerName}
                            </span>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-0 text-xs">
                            <span>
                                {formatDistanceToNow(
                                    new Date(session.createdAt),
                                    {
                                        addSuffix: true,
                                    },
                                )}
                            </span>
                            {session.latencyMs != null && (
                                <span>{session.latencyMs} ms</span>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        <Button variant="default" size="sm" asChild>
                            <a
                                href={siteUrls.devin.session(sessionId)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Devin
                                <ExternalLinkIcon className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                        <Link
                            href={siteUrls.relay.execution(
                                session.projectId,
                                session.id,
                            )}
                            className="text-muted-foreground hover:text-foreground text-xs"
                        >
                            View execution
                        </Link>
                    </div>
                </div>
        </div>
    );
}
