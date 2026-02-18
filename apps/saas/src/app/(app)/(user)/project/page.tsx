import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { relayProjectsPageConfig } from "@/app/(app)/(user)/project/_constants/page-config";
import {
    getRelayProjects,
    getProjectStats,
} from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { CreateProjectDialog } from "./_components/create-project-dialog";

export default async function ProjectListPage() {
    const projects = await getRelayProjects();
    const stats = await Promise.all(
        projects.map((p) => getProjectStats(p.id)),
    );

    return (
        <AppPageShell
            title={relayProjectsPageConfig.title}
            description={relayProjectsPageConfig.description}
        >
            <div className="flex flex-col gap-6">
                <div className="flex justify-end">
                    <CreateProjectDialog />
                </div>
                {projects.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                        <p className="text-muted-foreground mb-4 text-center text-sm">
                            No projects yet. Create your first project to start
                            receiving webhooks and running Devin.
                        </p>
                        <CreateProjectDialog triggerLabel="Create your first project" />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, i) => (
                            <Link
                                key={project.id}
                                href={siteUrls.relay.project(project.id)}
                            >
                                <Card className="transition-colors hover:bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <span className="font-medium">
                                            {project.name}
                                        </span>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        <span>
                                            {stats[i]?.triggerCount ?? 0} triggers
                                        </span>
                                        {stats[i]?.lastExecution ? (
                                            <span>
                                                {" "}
                                                · Last run{" "}
                                                {new Date(
                                                    stats[i].lastExecution!,
                                                ).toLocaleDateString()}
                                            </span>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppPageShell>
    );
}
