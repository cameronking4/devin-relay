import { db } from "@/server/db";
import { relayEvents, relayWorkflows } from "@/server/db/schema";
import type { WorkflowCondition } from "@/server/relay/conditions";
import { passesWorkflowConditions } from "@/server/relay/conditions";
import { executionQueue } from "@/server/relay/queue";
import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

/**
 * When a new event is stored for a trigger, evaluate all workflows that
 * include this trigger. If a workflow's match condition is satisfied
 * (any/all triggers have events in the time window), enqueue an
 * execute-workflow job. Deduplication is by workflow + time bucket.
 */
export async function evaluateWorkflowsOnNewEvent(opts: {
    projectId: string;
    triggerId: string;
}): Promise<void> {
    const { projectId, triggerId } = opts;

    const workflows = await db
        .select()
        .from(relayWorkflows)
        .where(
            and(
                eq(relayWorkflows.projectId, projectId),
                eq(relayWorkflows.enabled, true),
            ),
        );

    const triggerIdsFilter = (wf: { triggerIds: string[] | null }) =>
        Array.isArray(wf.triggerIds) &&
        wf.triggerIds.length > 0 &&
        wf.triggerIds.includes(triggerId);

    const relevant = workflows.filter(triggerIdsFilter);
    if (relevant.length === 0) return;

    const now = new Date();

    for (const workflow of relevant) {
        const triggerIds = (workflow.triggerIds ?? []) as string[];
        const windowMs = workflow.timeWindowMinutes * 60 * 1000;
        const windowStart = new Date(now.getTime() - windowMs);
        const windowEnd = now;

        const eventsInWindow = await db
            .select()
            .from(relayEvents)
            .where(
                and(
                    eq(relayEvents.projectId, projectId),
                    inArray(relayEvents.triggerId, triggerIds),
                    isNull(relayEvents.executionId),
                    gte(relayEvents.receivedAt, windowStart),
                    lte(relayEvents.receivedAt, windowEnd),
                ),
            );

        const workflowConditions = (workflow.conditions ?? []) as WorkflowCondition[];
        const eventsPassing = eventsInWindow.filter((e) =>
            passesWorkflowConditions(
                { triggerId: e.triggerId, rawPayload: e.rawPayload },
                workflowConditions,
            ),
        );

        const eventsByTrigger = new Map<string, typeof eventsInWindow>();
        for (const ev of eventsPassing) {
            const list = eventsByTrigger.get(ev.triggerId) ?? [];
            list.push(ev);
            eventsByTrigger.set(ev.triggerId, list);
        }

        const match =
            workflow.matchMode === "any"
                ? triggerIds.some((tid) => (eventsByTrigger.get(tid)?.length ?? 0) > 0)
                : triggerIds.every((tid) => (eventsByTrigger.get(tid)?.length ?? 0) > 0);

        if (!match) continue;

        const eventIds = eventsPassing.map((e) => e.id);
        const bucket = Math.floor(now.getTime() / windowMs);
        const jobId = `workflow-${workflow.id}-${bucket}`.slice(0, 100);

        await executionQueue.add(
            "execute-workflow",
            {
                kind: "workflow",
                workflowId: workflow.id,
                eventIds,
                windowStart: windowStart.toISOString(),
                windowEnd: windowEnd.toISOString(),
            },
            { jobId },
        );
    }
}
