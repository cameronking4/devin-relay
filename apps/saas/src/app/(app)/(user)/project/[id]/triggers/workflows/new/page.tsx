import { getRelayProjectForOverview, getTriggersByProjectId } from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { WorkflowForm } from "../../_components/workflow-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";

const DEFAULT_PROMPT =
    "These events occurred within the time window. Review and suggest next steps:\n\n{{payload.summary}}\n\nEvent data:\n{{#payload.events}}\n- {{receivedAt}}: {{payload}}\n{{/payload.events}}";

export default async function NewWorkflowPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const triggers = await getTriggersByProjectId(projectId);

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
                        Create event workflow
                    </h1>
                    <p className="max-w-xl text-muted-foreground">
                        Combine events from multiple triggers. Devin runs when
                        the match condition is met within the time window.
                    </p>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <WorkflowForm
                    projectId={projectId}
                    initialName=""
                    initialTriggerIds={[]}
                    initialMatchMode="all"
                    initialTimeWindowMinutes={5}
                    initialPromptTemplate={DEFAULT_PROMPT}
                    initialGithubRepo=""
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
