import { getRelayProjectForOverview } from "@/server/actions/relay/queries";
import { notFound } from "next/navigation";
import { CreateTriggerForm } from "../_components/create-trigger-form";

export default async function NewTriggerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = await params;
    const project = await getRelayProjectForOverview(projectId);
    if (!project) notFound();

    return (
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-1 border-border">
                    <h1 className="font-heading text-2xl font-bold">
                        Create Trigger
                    </h1>
                    <p className="max-w-xl text-muted-foreground">
                        Configure a Devin trigger. You'll get a webhook URL to
                        add to your external service, then configure the prompt
                        that tells Devin what to do.
                    </p>
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    <CreateTriggerForm projectId={projectId} />
                </div>
            </main>
        </div>
    );
}
