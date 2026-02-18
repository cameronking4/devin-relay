import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { executionsPageConfig } from "./_constants/page-config";
import {
    getExecutionsByProjectId,
    getRelayProjectForOverview,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { ExecutionsTable } from "./_components/executions-table";

export default async function ExecutionsListPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const executions = await getExecutionsByProjectId(projectId);

    return (
        <AppPageShell
            title={executionsPageConfig.title}
            description={executionsPageConfig.description}
        >
            {executions.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                    <p className="text-muted-foreground mb-4 text-center text-sm">
                        No executions yet. Triggers will create executions when
                        events match.
                    </p>
                </div>
            ) : (
                <ExecutionsTable
                    projectId={projectId}
                    executions={executions}
                />
            )}
        </AppPageShell>
    );
}
