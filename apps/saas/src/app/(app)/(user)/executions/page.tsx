import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { executionsBrowsePageConfig } from "./_constants/page-config";
import {
    getExecutionsForOrg,
    getRelayProjects,
} from "@/server/actions/relay/queries";
import {
    ExecutionsDataGrid,
    CreateWorkflowDropdown,
} from "./_components/executions-data-grid";
import Link from "next/link";
import { siteUrls } from "@/config/urls";
import { Button } from "@/components/ui/button";

export default async function ExecutionsBrowsePage() {
    const [executions, projects] = await Promise.all([
        getExecutionsForOrg({ limit: 300 }),
        getRelayProjects(),
    ]);

    const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

    return (
        <AppPageShell
            title={executionsBrowsePageConfig.title}
            description={executionsBrowsePageConfig.description}
            actions={
                projectOptions.length > 0 ? (
                    <CreateWorkflowDropdown projects={projectOptions} />
                ) : null
            }
        >
            {executions.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12">
                    <div className="mx-auto max-w-md text-center">
                        <p className="text-muted-foreground mb-2 text-base">
                            No executions yet. Triggers and workflows create
                            executions when events match.
                        </p>
                        <p className="text-muted-foreground mb-6 text-sm">
                            Add a trigger in a project to start receiving
                            webhooks, or create a workflow to combine triggers.
                        </p>
                        {projectOptions.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-2">
                                <CreateWorkflowDropdown
                                    projects={projectOptions}
                                />
                                <Button variant="outline" asChild>
                                    <Link href={siteUrls.relay.triggersAll}>
                                        Browse triggers
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Button asChild>
                                <Link href={siteUrls.relay.projects}>
                                    Create project
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <ExecutionsDataGrid
                    executions={executions}
                    projects={projectOptions}
                />
            )}
        </AppPageShell>
    );
}
