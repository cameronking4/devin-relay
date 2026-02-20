"use client";

import * as React from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTablePagination } from "@/app/(app)/_components/data-table-pagination";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MoreHorizontalIcon,
    ArrowRightIcon,
    RotateCcwIcon,
    ExternalLinkIcon,
    GitBranchIcon,
} from "lucide-react";
import { toast } from "sonner";
import { rerunExecution } from "@/server/actions/relay/mutations";

export type ExecutionRowOrg = {
    id: string;
    projectId: string;
    projectName: string;
    triggerId: string;
    workflowId: string | null;
    triggerName: string;
    triggerSource: string | null;
    triggerEventType: string | null;
    workflowName: string | null;
    status: "pending" | "running" | "completed" | "failed";
    latencyMs: number | null;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    eventIds: string[] | null;
    eventReceivedAt: Date | null;
    aiSessionId: string | null;
};

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

function truncateError(err: string | null | undefined, maxLen = 50): string {
    if (!err) return "—";
    if (err.length <= maxLen) return err;
    return err.slice(0, maxLen) + "…";
}

const columns: ColumnDef<ExecutionRowOrg>[] = [
    {
        accessorKey: "projectName",
        header: "Project",
        cell: ({ row }) => (
            <Link
                href={siteUrls.relay.project(row.original.projectId)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm hover:underline"
            >
                {row.original.projectName}
                <ExternalLinkIcon className="h-3 w-3" />
            </Link>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={
                    STATUS_VARIANTS[row.original.status] ?? "outline"
                }
            >
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: "triggerName",
        header: "Trigger",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <Link
                    href={siteUrls.relay.trigger(
                        row.original.projectId,
                        row.original.triggerId,
                    )}
                    className="font-medium hover:underline"
                >
                    {row.original.triggerName ?? "—"}
                </Link>
                {row.original.triggerSource && (
                    <span className="text-muted-foreground text-xs">
                        {row.original.triggerSource}
                        {row.original.triggerEventType
                            ? ` · ${row.original.triggerEventType}`
                            : ""}
                    </span>
                )}
            </div>
        ),
    },
    {
        id: "origin",
        header: "Origin",
        cell: ({ row }) =>
            row.original.workflowName ? (
                <span className="text-muted-foreground text-sm">
                    Workflow: {row.original.workflowName}
                </span>
            ) : (
                <span className="text-muted-foreground text-sm">Trigger</span>
            ),
    },
    {
        id: "events",
        header: "Events",
        cell: ({ row }) =>
            row.original.eventIds &&
            Array.isArray(row.original.eventIds) &&
            row.original.eventIds.length > 1
                ? `${row.original.eventIds.length} events`
                : "1 event",
    },
    {
        accessorKey: "eventReceivedAt",
        header: "Received",
        cell: ({ row }) =>
            row.original.eventReceivedAt
                ? new Date(
                      row.original.eventReceivedAt,
                  ).toLocaleString()
                : "—",
    },
    {
        id: "startedAt",
        header: "Started",
        cell: ({ row }) =>
            row.original.startedAt
                ? new Date(row.original.startedAt).toLocaleString()
                : row.original.createdAt
                  ? new Date(row.original.createdAt).toLocaleString()
                  : "—",
    },
    {
        accessorKey: "latencyMs",
        header: "Duration",
        cell: ({ row }) => formatDuration(row.original.latencyMs),
    },
    {
        id: "error",
        header: "Error",
        cell: ({ row }) =>
            row.original.status === "failed" && row.original.error ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="max-w-[12rem] min-w-0 cursor-help overflow-hidden text-ellipsis whitespace-nowrap text-destructive text-xs">
                            {row.original.error}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-sm break-words">
                        {row.original.error}
                    </TooltipContent>
                </Tooltip>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            ),
    },
    {
        id: "devin",
        header: "Devin",
        cell: ({ row }) =>
            row.original.aiSessionId ? (
                <Button variant="ghost" size="sm" asChild>
                    <a
                        href={siteUrls.devin.session(row.original.aiSessionId)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View session
                        <ExternalLinkIcon className="ml-1 h-4 w-4" />
                    </a>
                </Button>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            ),
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
            <ExecutionRowActions
                projectId={row.original.projectId}
                executionId={row.original.id}
            />
        ),
    },
];

function ExecutionRowActions({
    projectId,
    executionId,
}: {
    projectId: string;
    executionId: string;
}) {
    const router = useRouter();
    const [rerunId, setRerunId] = React.useState<string | null>(null);

    async function handleRerun() {
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
                        href={siteUrls.relay.execution(projectId, executionId)}
                    >
                        <ArrowRightIcon className="mr-2 h-4 w-4" />
                        View details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleRerun()}
                    disabled={rerunId === executionId}
                >
                    <RotateCcwIcon className="mr-2 h-4 w-4" />
                    Re-run with same event
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type ExecutionsDataGridProps = {
    executions: ExecutionRowOrg[];
    projects: { id: string; name: string }[];
};

export function ExecutionsDataGrid({
    executions,
    projects,
}: ExecutionsDataGridProps) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [projectFilter, setProjectFilter] = React.useState<string>("all");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [search, setSearch] = React.useState("");

    const filteredData = React.useMemo(() => {
        let data = executions;
        if (projectFilter !== "all")
            data = data.filter((e) => e.projectId === projectFilter);
        if (statusFilter !== "all")
            data = data.filter((e) => e.status === statusFilter);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            data = data.filter(
                (e) =>
                    e.projectName.toLowerCase().includes(q) ||
                    e.triggerName.toLowerCase().includes(q) ||
                    (e.workflowName?.toLowerCase().includes(q) ?? false),
            );
        }
        return data;
    }, [executions, projectFilter, statusFilter, search]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <TooltipProvider>
            <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        placeholder="Search by project or trigger..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 w-[200px] bg-background lg:w-[280px]"
                    />
                    <Select
                        value={projectFilter}
                        onValueChange={setProjectFilter}
                    >
                        <SelectTrigger className="h-8 w-[160px]">
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
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                    {(projectFilter !== "all" ||
                        statusFilter !== "all" ||
                        search) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                                setProjectFilter("all");
                                setStatusFilter("all");
                                setSearch("");
                            }}
                        >
                            Reset filters
                        </Button>
                    )}
                </div>

                <div className="min-w-0 overflow-x-auto rounded-md border border-border bg-background">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : (flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  ) as React.ReactNode)}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                ) as React.ReactNode}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No executions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DataTablePagination
                    table={table}
                    totalRows={filteredData.length}
                />
            </div>
        </TooltipProvider>
    );
}

export function CreateWorkflowDropdown({
    projects,
}: {
    projects: { id: string; name: string }[];
}) {
    if (projects.length === 0) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <GitBranchIcon className="h-4 w-4" />
                    Create workflow
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {projects.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                        <Link
                            href={siteUrls.relay.workflowNew(p.id)}
                        >
                            {p.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
