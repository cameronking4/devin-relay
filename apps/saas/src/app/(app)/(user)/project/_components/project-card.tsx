"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteRelayProject } from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import {
    MoreHorizontalIcon,
    PencilIcon,
    Trash2Icon,
    ZapIcon,
    ArrowRightIcon,
} from "lucide-react";
import { EditProjectDialog } from "./edit-project-dialog";
import { formatDistanceToNow } from "date-fns";

type ProjectStats = {
    triggerCount: number;
    executionsToday: number;
    lastExecution: Date | null;
};

type Project = {
    id: string;
    name: string;
    createdAt: Date;
};

export function ProjectCard({
    project,
    stats,
}: {
    project: Project;
    stats: ProjectStats;
}) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pending, setPending] = useState(false);

    async function handleDelete() {
        setPending(true);
        try {
            await deleteRelayProject(project.id);
            toast.success("Project deleted");
            setDeleteOpen(false);
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to delete project",
            );
        } finally {
            setPending(false);
        }
    }

    const hasActivity = stats.executionsToday > 0 || stats.lastExecution;

    return (
        <>
            <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                <div
                    className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Project actions"
                            >
                                <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setEditOpen(true);
                                }}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDeleteOpen(true);
                                }}
                            >
                                <Trash2Icon className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Link href={siteUrls.relay.project(project.id)}>
                    <CardHeader className="pb-2 pt-6 pr-12">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{project.name}</span>
                            {hasActivity && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    <ZapIcon className="mr-1 h-3 w-3" />
                                    Active
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                                {stats.triggerCount}{" "}
                                {stats.triggerCount === 1 ? "trigger" : "triggers"}
                            </span>
                            {stats.executionsToday > 0 && (
                                <span className="text-primary">
                                    {stats.executionsToday} today
                                </span>
                            )}
                            {stats.lastExecution ? (
                                <span>
                                    Last run{" "}
                                    {formatDistanceToNow(
                                        new Date(stats.lastExecution),
                                        {
                                            addSuffix: true,
                                        },
                                    )}
                                </span>
                            ) : (
                                <span>No runs yet</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>
                                Created{" "}
                                {formatDistanceToNow(new Date(project.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                            <ArrowRightIcon className="h-3 w-3 opacity-50" />
                        </div>
                    </CardContent>
                </Link>
            </Card>

            <EditProjectDialog
                projectId={project.id}
                initialName={project.name}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{project.name}" and all
                            its triggers, events, and executions. This cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete()}
                            disabled={pending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {pending ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
