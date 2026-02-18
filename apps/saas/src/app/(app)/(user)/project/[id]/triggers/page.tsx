import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { triggersPageConfig } from "./_constants/page-config";
import {
    getTriggersByProjectId,
    getRelayProjectForOverview,
} from "@/server/actions/relay/queries";
import { siteUrls } from "@/config/urls";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { TriggersTable } from "./_components/triggers-table";

export default async function TriggersListPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();
    const triggers = await getTriggersByProjectId(projectId);

    return (
        <AppPageShell
            title={triggersPageConfig.title}
            description={triggersPageConfig.description}
        >
            <div className="flex flex-col gap-6">
                <div className="flex justify-end">
                    <Button asChild>
                        <Link href={siteUrls.relay.triggerNew(projectId)}>
                            <PlusIcon className="h-4 w-4" />
                            Create trigger
                        </Link>
                    </Button>
                </div>
                {triggers.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8">
                        <p className="text-muted-foreground mb-4 text-center text-sm">
                            No triggers yet. Create a trigger to receive
                            webhooks and run Devin.
                        </p>
                        <Button asChild>
                            <Link href={siteUrls.relay.triggerNew(projectId)}>
                                Create trigger
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <TriggersTable
                        projectId={projectId}
                        triggers={triggers}
                    />
                )}
            </div>
        </AppPageShell>
    );
}
