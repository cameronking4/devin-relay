import { AppPageShell } from "@/app/(app)/_components/page-shell";
import {
    getRelayProjectForOverview,
    getTriggerById,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { EditTriggerForm } from "../_components/edit-trigger-form";
import { WebhookUrlCard } from "../_components/webhook-url-card";
import { TestWebhookBlock } from "../_components/test-webhook-block";
import { IntegrationGuide } from "../_components/integration-guide";
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
        <AppPageShell
            title="Edit trigger"
            description="Update webhook trigger settings."
        >
            <div className="space-y-6">
                <WebhookUrlCard triggerId={triggerId} />
                <WebhookActivity triggerId={triggerId} projectId={projectId} />
                <IntegrationGuide triggerId={triggerId} />
                <RecentPayloads triggerId={triggerId} projectId={projectId} />
                <TestWebhookBlock triggerId={triggerId} projectId={projectId} />
                <EditTriggerForm
                projectId={projectId}
                triggerId={triggerId}
                initialValues={{
                    name: trigger.name,
                    source: trigger.source,
                    eventType: trigger.eventType,
                    promptTemplate: trigger.promptTemplate,
                    conditions: (trigger.conditions ?? []) as {
                        path: string;
                        operator: string;
                        value: unknown;
                    }[],
                    thresholdConfig: trigger.thresholdConfig,
                    concurrencyLimit: trigger.concurrencyLimit,
                    dailyCap: trigger.dailyCap,
                }}
                />
            </div>
        </AppPageShell>
    );
}
