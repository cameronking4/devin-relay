import { getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { getProjectStats } from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectKeyForm } from "./_components/project-key-form";
import { ContextInstructionsForm } from "./_components/context-instructions-form";
import { ProjectStatsCards } from "./_components/project-stats-cards";

export default async function ProjectOverviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const project = await getRelayProjectForOverview(id);
    if (!project) notFound();
    const stats = await getProjectStats(id);

    return (
        <div className="space-y-8 border p-4 rounded-lg">
            <div className="flex flex-col items-start gap-2">
                <h1 className="text-2xl font-semibold leading-tight tracking-tight">
                    {project.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                    Project Overview.{" "}
                    {project.hasDevinKey && (
                        <span className="inline-flex items-center text-green-600 ml-2">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Devin key set</span>
                        </span>
                    )}
                </p>
                <div className="flex flex-wrap gap-4">
                <Button asChild variant="outline">
                    <Link href={siteUrls.relay.triggerNew(id)}>
                        Add trigger
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href={siteUrls.relay.executions(id)}>
                        View executions
                    </Link>
                </Button>
            </div>
            </div>
            <ProjectStatsCards
                triggerCount={stats.triggerCount}
                executionsToday={stats.executionsToday}
                lastExecution={stats.lastExecution}
            />
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                <ProjectKeyForm
                    projectId={id}
                    hasDevinKey={project.hasDevinKey}
                />
                <ContextInstructionsForm
                    projectId={id}
                    initialInstructions={project.contextInstructions}
                />
            </div>
        </div>
    );
}
