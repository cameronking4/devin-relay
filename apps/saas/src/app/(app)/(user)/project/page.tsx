import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { relayProjectsPageConfig } from "@/app/(app)/(user)/project/_constants/page-config";
import {
    getRelayProjects,
    getProjectStats,
    getOrgProjectAggregateStats,
} from "@/server/actions/relay/queries";
import { CreateProjectDialog } from "./_components/create-project-dialog";
import { ProjectsHeaderActions } from "./_components/projects-header-actions";
import { ProjectsOverviewStats } from "./_components/projects-overview-stats";
import { ExecutionActivityChart } from "./_components/execution-activity-chart";
import { ProjectCard } from "./_components/project-card";

export default async function ProjectListPage() {
    const [projects, aggregateStats] = await Promise.all([
        getRelayProjects(),
        getOrgProjectAggregateStats(),
    ]);

    const statsByProject = await Promise.all(
        projects.map((p) => getProjectStats(p.id)),
    );

    return (
        <AppPageShell
            title={relayProjectsPageConfig.title}
            description={relayProjectsPageConfig.description}
            actions={<ProjectsHeaderActions projects={projects} />}
        >
            <div className="flex flex-col gap-8">
                <ProjectsOverviewStats stats={aggregateStats} />

                <ExecutionActivityChart
                    data={aggregateStats.executionHistory}
                />

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Your projects
                        </h2>
                        {projects.length > 0 && (
                            <ProjectsHeaderActions projects={projects} />
                        )}
                    </div>

                    {projects.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12">
                            <div className="mx-auto max-w-md text-center">
                                <p className="text-muted-foreground mb-2 text-base">
                                    No projects yet. Create your first project to
                                    start receiving webhooks and running Devin.
                                </p>
                                <p className="text-muted-foreground mb-6 text-sm">
                                    Set up event-driven AI automation in minutes.
                                </p>
                                <CreateProjectDialog triggerLabel="Create your first project" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project, i) => (
                                <ProjectCard
                                    key={project.id}
                                    project={{
                                        id: project.id,
                                        name: project.name,
                                        createdAt: project.createdAt,
                                    }}
                                    stats={{
                                        triggerCount:
                                            statsByProject[i]?.triggerCount ??
                                            0,
                                        executionsToday:
                                            statsByProject[i]
                                                ?.executionsToday ?? 0,
                                        lastExecution:
                                            statsByProject[i]?.lastExecution ??
                                            null,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppPageShell>
    );
}
