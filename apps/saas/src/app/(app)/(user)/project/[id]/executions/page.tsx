import { executionsPageConfig } from "./_constants/page-config";
import {
    getExecutionsByProjectId,
    getRelayProjectForOverview,
    getTriggerById,
} from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { ExecutionsTable } from "./_components/executions-table";
import { siteUrls } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ExecutionsListPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ triggerId?: string }>;
}) {
    const { id: projectId } = await params;
    const { triggerId } = await searchParams;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const executions = await getExecutionsByProjectId(projectId, {
        triggerId: triggerId ?? undefined,
        limit: 100,
    });
    const triggerFilter =
        triggerId != null
            ? await getTriggerById(triggerId, projectId)
            : null;

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
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {triggerFilter != null && (
                                <Link
                                    href={siteUrls.relay.executions(projectId)}
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-md border border-transparent",
                                        "bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-semibold",
                                        "hover:bg-secondary/80 transition-colors",
                                    )}
                                >
                                    Trigger: {triggerFilter.name}
                                    <XIcon className="h-3 w-3" />
                                </Link>
                            )}
                            <Button variant="outline" size="sm" asChild>
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
