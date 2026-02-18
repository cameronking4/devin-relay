import {
    getRelayProjectForOverview,
    getWorkflowById,
    getTriggersByProjectId,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { WorkflowForm } from "../../_components/workflow-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";

export default async function WorkflowEditPage({
    params,
}: {
    params: Promise<{ id: string; workflowId: string }>;
}) {
    const { id: projectId, workflowId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const workflow = await getWorkflowById(workflowId, projectId);
    if (!workflow) notFound();
    const triggers = await getTriggersByProjectId(projectId);

    const triggerIds = (workflow.triggerIds ?? []) as string[];

    return (
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-1 border-border">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={siteUrls.relay.triggers(projectId)}>
                                ← Triggers
                            </Link>
                        </Button>
                    </div>
                    <h1 className="font-heading text-2xl font-bold">
                        Edit workflow
                    </h1>
                    <p className="max-w-xl text-muted-foreground">
                        {workflow.name}
                    </p>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <WorkflowForm
                    projectId={projectId}
                    workflowId={workflow.id}
                    initialName={workflow.name}
                    initialTriggerIds={triggerIds}
                    initialMatchMode={workflow.matchMode}
                    initialTimeWindowMinutes={workflow.timeWindowMinutes}
                    initialPromptTemplate={workflow.promptTemplate}
                    initialGithubRepo={workflow.githubRepo ?? ""}
                    triggers={triggers.map((t) => ({
                        id: t.id,
                        name: t.name,
                        source: t.source,
                    }))}
                />
            </main>
        </div>
    );
}
