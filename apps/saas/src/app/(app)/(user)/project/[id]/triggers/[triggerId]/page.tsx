import {
    getRelayProjectForOverview,
    getTriggerById,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { EditTriggerForm } from "../_components/edit-trigger-form";
import { WebhookUrlCard } from "../_components/webhook-url-card";
import { TestWebhookBlock } from "../_components/test-webhook-block";
import { RecentPayloads } from "../_components/recent-payloads";
import { WebhookActivity } from "../_components/webhook-activity";

export default async function EditTriggerPage({
    params,
}: {
    params: Promise<{ id: string; triggerId: string }>;
}) {
    const { id: projectId, triggerId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const trigger = await getTriggerById(triggerId, projectId);
    if (!trigger) notFound();

    return (
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-1 border-border">
                    <h1 className="font-heading text-2xl font-bold">
                        Edit trigger: {trigger.name}
                    </h1>
                    <p className="max-w-xl text-muted-foreground">
                        Update webhook trigger settings.
                    </p>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    <WebhookUrlCard triggerId={triggerId} />
                    <WebhookActivity
                        triggerId={triggerId}
                        projectId={projectId}
                    />
                    <RecentPayloads
                        triggerId={triggerId}
                        projectId={projectId}
                    />
                    <TestWebhookBlock
                        triggerId={triggerId}
                        projectId={projectId}
                    />
                    <EditTriggerForm
                        projectId={projectId}
                        triggerId={triggerId}
                        initialValues={{
                            name: trigger.name,
                            source: trigger.source,
                            eventType: trigger.eventType,
                            githubRepo: trigger.githubRepo ?? "",
                            promptTemplate: trigger.promptTemplate,
                            conditions: (trigger.conditions ?? []) as {
                                path: string;
                                operator: string;
                                value: unknown;
                            }[],
                            thresholdConfig: trigger.thresholdConfig,
                            concurrencyLimit: trigger.concurrencyLimit,
                            dailyCap: trigger.dailyCap,
                            includePaths: (trigger.includePaths as string[]) ?? [],
                            excludePaths: (trigger.excludePaths as string[]) ?? [],
                            lowNoiseMode: trigger.lowNoiseMode ?? false,
                        }}
                    />
                </div>
            </main>
        </div>
    );
}
