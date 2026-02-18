import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { CreateTriggerForm } from "../_components/create-trigger-form";

export default async function NewTriggerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();

    return (
        <AppPageShell
            title="Create Trigger"
            description="Configure a Devin trigger. You'll get a webhook URL to add to your external service, then configure the prompt that tells Devin what to do."
        >
            <CreateTriggerForm projectId={projectId} />
        </AppPageShell>
    );
}
