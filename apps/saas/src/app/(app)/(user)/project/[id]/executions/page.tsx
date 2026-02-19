import { executionsPageConfig } from "./_constants/page-config";
import {
    getExecutionsByProjectId,
    getRelayProjectForOverview,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { ExecutionsTable } from "./_components/executions-table";
import { siteUrls } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

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
                <header className="flex w-full flex-col gap-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold">
                                {executionsPageConfig.title}
                            </h1>
                            <p className="text-muted-foreground mt-1.5 max-w-xl text-sm">
                                {executionsPageConfig.description}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="shrink-0">
                            <a
                                href={siteUrls.devin.app}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open Devin app
                                <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    {executions.length === 0 ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                            <p className="text-muted-foreground mb-4 text-center text-sm">
                                No executions yet. Triggers will create executions when events match.{" "}
                                <a
                                    href={siteUrls.devin.app}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline hover:no-underline"
                                >
                                    Open Devin app
                                </a>
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
