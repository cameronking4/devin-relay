import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { triggersBrowsePageConfig } from "./_constants/page-config";
import { getTriggersForOrg, getRelayProjects } from "@/server/actions/relay/queries";
import { TriggersDataGrid, CreateTriggerDropdown } from "./_components/triggers-data-grid";
import Link from "next/link";
import { siteUrls } from "@/config/urls";
import { Button } from "@/components/ui/button";

export default async function TriggersBrowsePage() {
    const [triggers, projects] = await Promise.all([
        getTriggersForOrg({ limit: 300 }),
        getRelayProjects(),
    ]);

    const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

    return (
        <AppPageShell
            title={triggersBrowsePageConfig.title}
            description={triggersBrowsePageConfig.description}
            actions={projectOptions.length > 0 ? <CreateTriggerDropdown projects={projectOptions} /> : null}
        >
            {triggers.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-12">
                    <div className="mx-auto max-w-md text-center">
                        <p className="text-muted-foreground mb-2 text-base">
                            No triggers yet. Create a trigger in a project to
                            receive webhooks and run Devin.
                        </p>
                        <p className="text-muted-foreground mb-6 text-sm">
                            Go to a project and add a trigger, or create a new
                            project first.
                        </p>
                        {projectOptions.length > 0 ? (
                            <CreateTriggerDropdown projects={projectOptions} />
                        ) : (
                            <Button asChild>
                                <Link href={siteUrls.relay.projects}>
                                    Create project
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <TriggersDataGrid triggers={triggers} projects={projectOptions} />
            )}
        </AppPageShell>
    );
}
