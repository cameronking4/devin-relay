import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { getExecutionById, getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { ExecutionDetailView } from "../_components/execution-detail-view";

export default async function ExecutionDetailPage({
    params,
}: {
    params: Promise<{ id: string; executionId: string }>;
}) {
    const { id: projectId, executionId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const execution = await getExecutionById(executionId, projectId);
    if (!execution) notFound();

    return (
        <AppPageShell
            title={`Execution ${executionId.slice(0, 8)}…`}
            description="Devin session run for this webhook event."
        >
            <ExecutionDetailView execution={execution} projectId={projectId} />
        </AppPageShell>
    );
}
