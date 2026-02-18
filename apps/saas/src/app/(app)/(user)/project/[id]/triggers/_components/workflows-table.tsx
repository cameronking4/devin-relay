"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    deleteRelayWorkflow,
    updateRelayWorkflow,
} from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import {
    MoreHorizontalIcon,
    PencilIcon,
    Trash2Icon,
    PauseIcon,
    PlayIcon,
} from "lucide-react";

type WorkflowRow = Awaited<
    ReturnType<typeof import("@/server/actions/relay/queries").getWorkflowsByProjectId>
>[number];

export function WorkflowsTable({
    projectId,
    workflows,
}: {
    projectId: string;
    workflows: WorkflowRow[];
}) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function handleToggleEnabled(workflowId: string, current: boolean) {
        setPending(true);
        try {
            await updateRelayWorkflow(projectId, workflowId, { enabled: !current });
            toast.success(current ? "Workflow disabled" : "Workflow enabled");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to update workflow",
            );
        } finally {
            setPending(false);
        }
    }

    async function handleDelete(workflowId: string) {
        setPending(true);
        try {
            await deleteRelayWorkflow(projectId, workflowId);
            toast.success("Workflow deleted");
            setDeleteId(null);
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to delete workflow",
            );
        } finally {
            setPending(false);
        }
    }

    const triggerCount = (w: WorkflowRow) =>
        Array.isArray(w.triggerIds) ? w.triggerIds.length : 0;

    return (
        <>
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Triggers</TableHead>
                            <TableHead>Match</TableHead>
                            <TableHead>Window</TableHead>
                            <TableHead>Enabled</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workflows.map((w) => (
                            <TableRow key={w.id}>
                                <TableCell className="font-medium">
                                    <Link
                                        href={siteUrls.relay.workflow(
                                            projectId,
                                            w.id,
                                        )}
                                        className="hover:underline"
                                    >
                                        {w.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {triggerCount(w)} trigger(s)
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm capitalize">
                                    {w.matchMode}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {w.timeWindowMinutes} min
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={w.enabled ? "default" : "secondary"}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleToggleEnabled(w.id, w.enabled)
                                        }
                                        aria-label={
                                            w.enabled
                                                ? "Disable workflow"
                                                : "Enable workflow"
                                        }
                                    >
                                        {w.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
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
                                                    href={siteUrls.relay.workflow(
                                                        projectId,
                                                        w.id,
                                                    )}
                                                >
                                                    <PencilIcon className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleToggleEnabled(w.id, w.enabled)
                                                }
                                                disabled={pending}
                                            >
                                                {w.enabled ? (
                                                    <PauseIcon className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <PlayIcon className="mr-2 h-4 w-4" />
                                                )}
                                                {w.enabled ? "Disable" : "Enable"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setDeleteId(w.id)}
                                            >
                                                <Trash2Icon className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <AlertDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. The workflow will no longer
                            run when events match.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={pending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
