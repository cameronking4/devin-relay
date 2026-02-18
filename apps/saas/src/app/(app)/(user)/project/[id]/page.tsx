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
        <div className="space-y-8 pb-8">
            <ProjectStatsCards
                triggerCount={stats.triggerCount}
                executionsToday={stats.executionsToday}
                lastExecution={stats.lastExecution}
            />
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
