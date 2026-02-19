import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { triggersPageConfig } from "./_constants/page-config";
import {
    getTriggersByProjectId,
    getRelayProjectForOverview,
    getWorkflowsByProjectId,
} from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { TriggersTable } from "./_components/triggers-table";
import { WorkflowsTable } from "./_components/workflows-table";

export default async function TriggersListPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const [triggers, workflows] = await Promise.all([
        getTriggersByProjectId(projectId),
        getWorkflowsByProjectId(projectId),
    ]);

    return (
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold">
                                {triggersPageConfig.title}
                            </h1>
                            <p className="text-muted-foreground mt-1.5 max-w-xl text-sm">
                                {triggersPageConfig.description}
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button variant="outline" asChild>
                                <Link href={siteUrls.relay.workflowNew(projectId)}>
                                    Create workflow
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={siteUrls.relay.triggerNew(projectId)}>
                                    <PlusIcon className="h-4 w-4" />
                                    Create trigger
                                </Link>
                            </Button>
                        </div>
                    </div>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    
                    {triggers.length === 0 ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                            <p className="text-muted-foreground mb-4 text-center text-sm">
                                No triggers yet. Create a trigger to receive
                                webhooks and run Devin.
                            </p>
                            <Button asChild>
                                <Link href={siteUrls.relay.triggerNew(projectId)}>
                                    Create trigger
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <TriggersTable
                            projectId={projectId}
                            triggers={triggers}
                        />
                    )}
                </div>
                {workflows.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="font-heading text-lg font-semibold">
                            Event workflows
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-xl">
                            Combine events from multiple triggers. Runs when the
                            match condition is met within the time window.
                        </p>
                        <WorkflowsTable
                            projectId={projectId}
                            workflows={workflows}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
