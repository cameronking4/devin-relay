"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "./create-project-dialog";
import { DevinSessionsSheet } from "./devin-sessions-sheet";
import { EyeIcon } from "lucide-react";

type Project = { id: string; name: string };

export function ProjectsHeaderActions({
    projects,
}: {
    projects: Project[];
}) {
    const [sessionsOpen, setSessionsOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setSessionsOpen(true)}>
                <EyeIcon className="h-4 w-4 mr-2" />
                 Devin Sessions
            </Button>
            <CreateProjectDialog />
            <DevinSessionsSheet
                open={sessionsOpen}
                onOpenChange={setSessionsOpen}
                projects={projects}
            />
        </div>
    );
}
