"use client";

import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { useState } from "react";
import { getProjectSettingsForExport } from "@/server/actions/relay/queries";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontalIcon,
    PencilIcon,
    DownloadIcon,
} from "lucide-react";
import { EditProjectDialog } from "@/app/(app)/(user)/project/_components/edit-project-dialog";

export function ProjectBreadcrumbActions({
    projectId,
    projectName,
}: {
    projectId: string;
    projectName: string;
}) {
    const [editOpen, setEditOpen] = useState(false);

    async function handleDownloadSettings() {
        try {
            const settings = await getProjectSettingsForExport(projectId);
            if (!settings) {
                toast.error("Failed to load project settings");
                return;
            }
            const blob = new Blob([JSON.stringify(settings, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${projectName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-settings.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Project settings downloaded");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to download settings",
            );
        }
    }

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-md font-medium">
                    <Link
                        href={siteUrls.relay.projects}
                        className="hover:text-foreground underline"
                    >
                        Projects
                    </Link>
                    {" / "}
                    <span className="text-foreground">{projectName}</span>
                </p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
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
                            Edit name
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                handleDownloadSettings();
                            }}
                        >
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download project settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <EditProjectDialog
                projectId={projectId}
                initialName={projectName}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
