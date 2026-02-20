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
import { DataTablePagination } from "@/app/(app)/_components/data-table-pagination";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import {
    MoreHorizontalIcon,
    PencilIcon,
    CopyIcon,
    ExternalLinkIcon,
    PlusIcon,
} from "lucide-react";
import { toast } from "sonner";

export type TriggerRowOrg = {
    id: string;
    projectId: string;
    projectName: string;
    name: string;
    source: string;
    eventType: string;
    conditions: { path: string; operator: string; value: unknown }[] | null;
    enabled: boolean;
    createdAt: Date;
    lastTriggeredAt: Date | null;
};

const columns: ColumnDef<TriggerRowOrg>[] = [
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <Link
                href={siteUrls.relay.trigger(
                    row.original.projectId,
                    row.original.id,
                )}
                className="font-medium hover:underline"
            >
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        accessorKey: "eventType",
        header: "Event type",
    },
    {
        id: "conditions",
        header: "Conditions",
        cell: ({ row }) => {
            const c = row.original.conditions;
            if (!c?.length) return "—";
            if (c.length === 1)
                return `${c[0].path} ${c[0].operator} ${String(c[0].value)}`;
            return `${c.length} conditions`;
        },
    },
    {
        accessorKey: "enabled",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={row.original.enabled ? "default" : "secondary"}
            >
                {row.original.enabled ? "Enabled" : "Disabled"}
            </Badge>
        ),
    },
    {
        accessorKey: "lastTriggeredAt",
        header: "Last triggered",
        cell: ({ row }) =>
            row.original.lastTriggeredAt
                ? new Date(
                      row.original.lastTriggeredAt,
                  ).toLocaleString()
                : "—",
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => (
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
                            href={siteUrls.relay.trigger(
                                row.original.projectId,
                                row.original.id,
                            )}
                        >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit trigger
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`${siteUrls.relay.executions(row.original.projectId)}?triggerId=${row.original.id}`}
                        >
                            <ExternalLinkIcon className="mr-2 h-4 w-4" />
                            View trigger executions
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            const url =
                                (typeof window !== "undefined"
                                    ? window.location.origin
                                    : "") +
                                "/api/webhook/custom/" +
                                row.original.id;
                            void navigator.clipboard.writeText(url);
                            toast.success("Webhook URL copied");
                        }}
                    >
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy webhook URL
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

type TriggersDataGridProps = {
    triggers: TriggerRowOrg[];
    projects: { id: string; name: string }[];
};

export function TriggersDataGrid({ triggers, projects }: TriggersDataGridProps) {
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [projectFilter, setProjectFilter] = React.useState<string>("all");
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [nameSearch, setNameSearch] = React.useState("");

    const filteredData = React.useMemo(() => {
        let data = triggers;
        if (projectFilter !== "all")
            data = data.filter((t) => t.projectId === projectFilter);
        if (statusFilter === "enabled") data = data.filter((t) => t.enabled);
        if (statusFilter === "disabled") data = data.filter((t) => !t.enabled);
        if (nameSearch.trim()) {
            const q = nameSearch.trim().toLowerCase();
            data = data.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.projectName.toLowerCase().includes(q) ||
                    t.eventType.toLowerCase().includes(q),
            );
        }
        return data;
    }, [triggers, projectFilter, statusFilter, nameSearch]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            pagination,
            sorting,
            columnFilters,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search by name or event type..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
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
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                </Select>
                {(projectFilter !== "all" ||
                    statusFilter !== "all" ||
                    nameSearch) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                            setProjectFilter("all");
                            setStatusFilter("all");
                            setNameSearch("");
                        }}
                    >
                        Reset filters
                    </Button>
                )}
            </div>

            <div className="rounded-md border border-border bg-background">
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
                                    No triggers found.
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
    );
}

export function CreateTriggerDropdown({
    projects,
}: {
    projects: { id: string; name: string }[];
}) {
    if (projects.length === 0) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <PlusIcon className="h-4 w-4" />
                    Create trigger
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {projects.map((p) => (
                    <DropdownMenuItem key={p.id} asChild>
                        <Link
                            href={siteUrls.relay.triggerNew(p.id)}
                        >
                            {p.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
