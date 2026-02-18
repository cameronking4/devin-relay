"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateRelayTrigger } from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import {
    TriggerForm,
    type TriggerFormValues,
} from "./trigger-form";

export function EditTriggerForm({
    projectId,
    triggerId,
    initialValues,
}: {
    projectId: string;
    triggerId: string;
    initialValues: Partial<TriggerFormValues>;
}) {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    async function handleSubmit(values: TriggerFormValues) {
        setPending(true);
        try {
            await updateRelayTrigger(projectId, triggerId, {
                name: values.name,
                source: values.source,
                eventType: values.eventType,
                githubRepo: values.githubRepo,
                promptTemplate: values.promptTemplate,
                conditions: values.conditions,
                thresholdConfig: values.thresholdConfig,
                concurrencyLimit: values.concurrencyLimit,
                dailyCap: values.dailyCap,
                includePaths: values.includePaths,
                excludePaths: values.excludePaths,
            });
            toast.success("Trigger updated");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to update trigger",
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <TriggerForm
            projectId={projectId}
            triggerId={triggerId}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            pending={pending}
            submitLabel="Save"
        />
    );
}
