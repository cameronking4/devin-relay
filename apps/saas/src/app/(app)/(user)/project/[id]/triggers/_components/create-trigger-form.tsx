"use client";

import { TriggerWizard } from "./trigger-wizard";

export function CreateTriggerForm({ projectId }: { projectId: string }) {
    return <TriggerWizard projectId={projectId} />;
}
