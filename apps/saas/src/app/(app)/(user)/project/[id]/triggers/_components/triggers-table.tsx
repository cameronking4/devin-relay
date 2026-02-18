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
    deleteRelayTrigger,
    setRelayTriggerEnabled,
} from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import {
    MoreHorizontalIcon,
    PencilIcon,
    CopyIcon,
    Trash2Icon,
} from "lucide-react";

type TriggerRow = Awaited<
    ReturnType<typeof import("@/server/actions/relay/queries").getTriggersByProjectId>
>[number];

export function TriggersTable({
    projectId,
    triggers,
}: {
    projectId: string;
    triggers: TriggerRow[];
}) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    function copyWebhookUrl(triggerId: string) {
        const url =
            (typeof window !== "undefined" ? window.location.origin : "") +
            "/api/webhook/custom/" +
            triggerId;
        void navigator.clipboard.writeText(url);
        toast.success("Webhook URL copied");
    }

    async function handleToggleEnabled(triggerId: string, current: boolean) {
        setPending(true);
        try {
            await setRelayTriggerEnabled(projectId, triggerId, !current);
            toast.success(current ? "Trigger disabled" : "Trigger enabled");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to update trigger",
            );
        } finally {
            setPending(false);
        }
    }

    async function handleDelete(triggerId: string) {
        setPending(true);
        try {
            await deleteRelayTrigger(projectId, triggerId);
            toast.success("Trigger deleted");
            setDeleteId(null);
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to delete trigger",
            );
        } finally {
            setPending(false);
        }
    }

    function conditionsSummary(conditions: TriggerRow["conditions"]) {
        if (!conditions || conditions.length === 0) return "—";
        if (conditions.length === 1) {
            const c = conditions[0];
            return `${c.path} ${c.operator} ${String(c.value)}`;
        }
        return `${conditions.length} conditions`;
    }

    return (
        <>
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Event type</TableHead>
                            <TableHead>Conditions</TableHead>
                            <TableHead>Enabled</TableHead>
                            <TableHead>Last triggered</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {triggers.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">
                                    <Link
                                        href={siteUrls.relay.trigger(
                                            projectId,
                                            t.id,
                                        )}
                                        className="hover:underline"
                                    >
                                        {t.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{t.source}</TableCell>
                                <TableCell>{t.eventType}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {conditionsSummary(t.conditions)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={t.enabled ? "default" : "secondary"}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleToggleEnabled(t.id, t.enabled)
                                        }
                                        aria-label={
                                            t.enabled ? "Disable trigger" : "Enable trigger"
                                        }
                                    >
                                        {t.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {t.lastTriggeredAt
                                        ? new Date(
                                              t.lastTriggeredAt,
                                          ).toLocaleString()
                                        : "—"}
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
                                                    href={siteUrls.relay.trigger(
                                                        projectId,
                                                        t.id,
                                                    )}
                                                >
                                                    <PencilIcon className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => copyWebhookUrl(t.id)}
                                            >
                                                <CopyIcon className="mr-2 h-4 w-4" />
                                                Copy webhook URL
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleToggleEnabled(t.id, t.enabled)
                                                }
                                                disabled={pending}
                                            >
                                                {t.enabled ? "Disable" : "Enable"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setDeleteId(t.id)}
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
                        <AlertDialogTitle>Delete trigger?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. The webhook URL will stop
                            working.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteId && handleDelete(deleteId)
                            }
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
