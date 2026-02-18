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
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-1 border-border">
                    <h1 className="font-heading text-2xl font-bold">
                        {executionsPageConfig.title}
                    </h1>
                    <p className="max-w-xl text-muted-foreground">
                        {executionsPageConfig.description}
                    </p>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    {executions.length === 0 ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                            <p className="text-muted-foreground mb-4 text-center text-sm">
                                No executions yet. Triggers will create executions
                                when events match.
                            </p>
                        </div>
                    ) : (
                        <ExecutionsTable
                            projectId={projectId}
                            executions={executions}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
