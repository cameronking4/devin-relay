import { db } from "@/server/db";
import {
    relayEvents,
    relayExecutions,
    relayProjects,
    relayTriggers,
    relayWorkflows,
} from "@/server/db/schema";
import { buildDevinPrompt } from "@/server/relay/context-builder";
import { decrypt } from "@/server/relay/encryption";
import {
    DevinRateLimitError,
    executeSession,
} from "@/server/relay/devin-adapter";
import { executionQueue } from "@/server/relay/queue";
import { env } from "@/env";
import { and, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";

const SESSION_TIMEOUT_MS = 600_000; // 10 min
const LOW_NOISE_RETRY_DELAY_MS = 20_000; // 20s
const RATE_LIMIT_RETRY_DELAY_MS = 120_000; // 2 min
const MAX_429_RETRIES = 3;

export async function processExecutionJob(opts: {
    kind: "single";
    eventId: string;
    retryAfter429?: number;
}): Promise<void> {
    const { eventId, retryAfter429 = 0 } = opts;
    const events = await db
        .select()
        .from(relayEvents)
        .where(eq(relayEvents.id, eventId))
        .limit(1);
    const event = events[0];
    if (!event) {
        throw new Error(`Event ${eventId} not found`);
    }

    const triggers = await db
        .select()
        .from(relayTriggers)
        .where(eq(relayTriggers.id, event.triggerId))
        .limit(1);
    const trigger = triggers[0];
    if (!trigger || !trigger.enabled) {
        return;
    }

    // Low noise mode: serialize executions per trigger (one at a time)
    if (trigger.lowNoiseMode) {
        const [running] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(relayExecutions)
            .where(
                and(
                    eq(relayExecutions.triggerId, trigger.id),
                    eq(relayExecutions.status, "running"),
                ),
            );
        if ((running?.count ?? 0) > 0) {
            await executionQueue.add(
                "execute",
                { kind: "single", eventId },
                { delay: LOW_NOISE_RETRY_DELAY_MS },
            );
            return;
        }
    }

    const projects = await db
        .select()
        .from(relayProjects)
        .where(eq(relayProjects.id, event.projectId))
        .limit(1);
    const project = projects[0];
    if (!project) {
        throw new Error(`Project ${event.projectId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const executionsToday = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(relayExecutions)
        .where(
            and(
                eq(relayExecutions.projectId, project.id),
                gte(relayExecutions.createdAt, today),
            ),
        );
    const countToday = executionsToday[0]?.count ?? 0;
    if (countToday >= trigger.dailyCap) {
        const [capExec] = await db
            .insert(relayExecutions)
            .values({
                eventId: event.id,
                projectId: project.id,
                triggerId: trigger.id,
                status: "failed",
                error: `Daily cap (${trigger.dailyCap}) reached`,
            })
            .returning({ id: relayExecutions.id });
        if (capExec?.id) {
            await db
                .update(relayEvents)
                .set({ executionId: capExec.id })
                .where(eq(relayEvents.id, event.id));
        }
        return;
    }

    if (!project.devinApiKeyEncrypted || !env.RELAY_ENCRYPTION_KEY) {
        const [noKeyExec] = await db
            .insert(relayExecutions)
            .values({
                eventId: event.id,
                projectId: project.id,
                triggerId: trigger.id,
                status: "failed",
                error: "Project has no Devin API key configured",
            })
            .returning({ id: relayExecutions.id });
        if (noKeyExec?.id) {
            await db
                .update(relayEvents)
                .set({ executionId: noKeyExec.id })
                .where(eq(relayEvents.id, event.id));
        }
        return;
    }

    const apiKey = decrypt(project.devinApiKeyEncrypted, env.RELAY_ENCRYPTION_KEY);
    const prompt = buildDevinPrompt({
        promptTemplate: trigger.promptTemplate,
        contextInstructions: project.contextInstructions,
        rawPayload: event.rawPayload,
        githubRepo: trigger.githubRepo ?? "",
        includePaths: (trigger.includePaths as string[]) ?? [],
        excludePaths: (trigger.excludePaths as string[]) ?? [],
        lowNoiseMode: trigger.lowNoiseMode,
        triggerId: trigger.id,
    });

    const [execution] = await db
        .insert(relayExecutions)
        .values({
            eventId: event.id,
            projectId: project.id,
            triggerId: trigger.id,
            renderedPrompt: prompt,
            status: "running",
            startedAt: new Date(),
        })
        .returning();

    if (!execution?.id) {
        throw new Error("Failed to create execution record");
    }

    try {
        const result = await executeSession({
            apiKey,
            prompt,
            timeoutMs: SESSION_TIMEOUT_MS,
        });

        await db
            .update(relayExecutions)
            .set({
                aiSessionId: result.sessionId,
                status: "completed",
                output: result.output,
                completedAt: new Date(),
                latencyMs: result.latencyMs,
            })
            .where(eq(relayExecutions.id, execution.id));
        await db
            .update(relayEvents)
            .set({ executionId: execution.id })
            .where(eq(relayEvents.id, event.id));
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : String(err);

        // On 429 (concurrent session limit), re-queue with delay if under retry cap
        if (
            err instanceof DevinRateLimitError &&
            retryAfter429 < MAX_429_RETRIES
        ) {
            await executionQueue.add(
                "execute",
                {
                    kind: "single",
                    eventId,
                    retryAfter429: retryAfter429 + 1,
                },
                { delay: RATE_LIMIT_RETRY_DELAY_MS },
            );
            const friendlyMessage =
                "Devin concurrent session limit reached (5). A retry has been queued for 2 minutes from now. You can also put some Devins to sleep in the Devin app or upgrade your plan.";
            await db
                .update(relayExecutions)
                .set({
                    status: "failed",
                    error: friendlyMessage,
                    completedAt: new Date(),
                })
                .where(eq(relayExecutions.id, execution.id));
            return;
        }

        await db
            .update(relayExecutions)
            .set({
                status: "failed",
                error: errorMessage,
                completedAt: new Date(),
            })
            .where(eq(relayExecutions.id, execution.id));
    }
}

export async function processBatchExecutionJob(opts: {
    kind: "batch";
    triggerId: string;
    windowStart: string;
    windowEnd: string;
}): Promise<void> {
    const { triggerId, windowStart, windowEnd } = opts;
    const windowStartDate = new Date(windowStart);
    const windowEndDate = new Date(windowEnd);

    const triggers = await db
        .select()
        .from(relayTriggers)
        .where(eq(relayTriggers.id, triggerId))
        .limit(1);
    const trigger = triggers[0];
    if (!trigger || !trigger.enabled) {
        return;
    }

    const events = await db
        .select()
        .from(relayEvents)
        .where(
            and(
                eq(relayEvents.triggerId, triggerId),
                isNull(relayEvents.executionId),
                gte(relayEvents.receivedAt, windowStartDate),
                lte(relayEvents.receivedAt, windowEndDate),
            ),
        )
        .orderBy(relayEvents.receivedAt);

    if (events.length === 0) {
        return;
    }

    const project = await db
        .select()
        .from(relayProjects)
        .where(eq(relayProjects.id, trigger.projectId))
        .limit(1)
        .then((rows) => rows[0]);
    if (!project) {
        throw new Error(`Project ${trigger.projectId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const executionsToday = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(relayExecutions)
        .where(
            and(
                eq(relayExecutions.projectId, project.id),
                gte(relayExecutions.createdAt, today),
            ),
        );
    const countToday = executionsToday[0]?.count ?? 0;
    if (countToday >= trigger.dailyCap) {
        const failedError = `Daily cap (${trigger.dailyCap}) reached`;
        const [capExecution] = await db
            .insert(relayExecutions)
            .values({
                eventId: events[0]!.id,
                projectId: project.id,
                triggerId: trigger.id,
                eventIds: events.map((e) => e.id),
                status: "failed",
                error: failedError,
            })
            .returning();
        if (capExecution?.id) {
            await db
                .update(relayEvents)
                .set({ executionId: capExecution.id })
                .where(inArray(relayEvents.id, events.map((e) => e.id)));
        }
        return;
    }

    if (!project.devinApiKeyEncrypted || !env.RELAY_ENCRYPTION_KEY) {
        const [execution] = await db
            .insert(relayExecutions)
            .values({
                eventId: events[0]!.id,
                projectId: project.id,
                triggerId: trigger.id,
                eventIds: events.map((e) => e.id),
                status: "failed",
                error: "Project has no Devin API key configured",
            })
            .returning();
        if (execution?.id) {
            await db
                .update(relayEvents)
                .set({ executionId: execution.id })
                .where(inArray(relayEvents.id, events.map((e) => e.id)));
        }
        return;
    }

    const apiKey = decrypt(
        project.devinApiKeyEncrypted,
        env.RELAY_ENCRYPTION_KEY,
    );
    const batchPayload = {
        events: events.map((e) => ({
            receivedAt: e.receivedAt.toISOString(),
            payload: e.rawPayload,
        })),
        count: events.length,
    };
    const prompt = buildDevinPrompt({
        promptTemplate: trigger.promptTemplate,
        contextInstructions: project.contextInstructions,
        rawPayload: batchPayload,
        githubRepo: trigger.githubRepo ?? "",
        includePaths: (trigger.includePaths as string[]) ?? [],
        excludePaths: (trigger.excludePaths as string[]) ?? [],
        lowNoiseMode: trigger.lowNoiseMode,
        triggerId: trigger.id,
    });

    const [execution] = await db
        .insert(relayExecutions)
        .values({
            eventId: events[0]!.id,
            projectId: project.id,
            triggerId: trigger.id,
            eventIds: events.map((e) => e.id),
            renderedPrompt: prompt,
            status: "running",
            startedAt: new Date(),
        })
        .returning();

    if (!execution?.id) {
        throw new Error("Failed to create execution record");
    }

    try {
        const result = await executeSession({
            apiKey,
            prompt,
            timeoutMs: SESSION_TIMEOUT_MS,
        });

        await db
            .update(relayExecutions)
            .set({
                aiSessionId: result.sessionId,
                status: "completed",
                output: result.output,
                completedAt: new Date(),
                latencyMs: result.latencyMs,
            })
            .where(eq(relayExecutions.id, execution.id));
        await db
            .update(relayEvents)
            .set({ executionId: execution.id })
            .where(inArray(relayEvents.id, events.map((e) => e.id)));
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : String(err);
        await db
            .update(relayExecutions)
            .set({
                status: "failed",
                error: errorMessage,
                completedAt: new Date(),
            })
            .where(eq(relayExecutions.id, execution.id));
    }
}

export async function processWorkflowExecutionJob(opts: {
    kind: "workflow";
    workflowId: string;
    eventIds: string[];
    windowStart: string;
    windowEnd: string;
}): Promise<void> {
    const { workflowId, eventIds, windowStart, windowEnd } = opts;
    if (eventIds.length === 0) return;

    const workflows = await db
        .select()
        .from(relayWorkflows)
        .where(eq(relayWorkflows.id, workflowId))
        .limit(1);
    const workflow = workflows[0];
    if (!workflow || !workflow.enabled) return;

    const events = await db
        .select()
        .from(relayEvents)
        .where(inArray(relayEvents.id, eventIds))
        .orderBy(relayEvents.receivedAt);

    if (events.length === 0) return;

    const triggerIds = [...new Set(events.map((e) => e.triggerId))];
    const triggersList = await db
        .select({ id: relayTriggers.id, name: relayTriggers.name, source: relayTriggers.source })
        .from(relayTriggers)
        .where(inArray(relayTriggers.id, triggerIds));
    const triggerNames = new Map(triggersList.map((t) => [t.id, t.name || t.source || t.id]));

    const project = await db
        .select()
        .from(relayProjects)
        .where(eq(relayProjects.id, workflow.projectId))
        .limit(1)
        .then((rows) => rows[0]);
    if (!project) throw new Error(`Project ${workflow.projectId} not found`);

    if (!project.devinApiKeyEncrypted || !env.RELAY_ENCRYPTION_KEY) {
        const [exec] = await db
            .insert(relayExecutions)
            .values({
                eventId: events[0]!.id,
                projectId: project.id,
                triggerId: events[0]!.triggerId,
                workflowId: workflow.id,
                eventIds: events.map((e) => e.id),
                status: "failed",
                error: "Project has no Devin API key configured",
            })
            .returning();
        if (exec?.id) {
            await db
                .update(relayEvents)
                .set({ executionId: exec.id })
                .where(inArray(relayEvents.id, eventIds));
        }
        return;
    }

    const apiKey = decrypt(
        project.devinApiKeyEncrypted,
        env.RELAY_ENCRYPTION_KEY,
    );
    const eventsWithMeta = events.map((e) => ({
        receivedAt: e.receivedAt.toISOString(),
        payload: e.rawPayload,
    }));
    const sources: Record<string, typeof eventsWithMeta> = {};
    for (const e of events) {
        const label = triggerNames.get(e.triggerId) ?? e.triggerId;
        if (!sources[label]) sources[label] = [];
        sources[label].push({
            receivedAt: e.receivedAt.toISOString(),
            payload: e.rawPayload,
        });
    }
    const summaryParts = Object.entries(sources).map(
        ([name, arr]) => `${arr.length} from ${name}`,
    );
    const rawPayload = {
        events: eventsWithMeta,
        count: events.length,
        windowStart,
        windowEnd,
        sources,
        summary: `${events.length} event(s): ${summaryParts.join("; ")}.`,
    };
    const prompt = buildDevinPrompt({
        promptTemplate: workflow.promptTemplate,
        contextInstructions: project.contextInstructions,
        rawPayload,
        githubRepo: workflow.githubRepo ?? "",
        includePaths: (workflow.includePaths as string[]) ?? [],
        excludePaths: (workflow.excludePaths as string[]) ?? [],
        triggerId: workflow.id,
    });

    const [execution] = await db
        .insert(relayExecutions)
        .values({
            eventId: events[0]!.id,
            projectId: project.id,
            triggerId: events[0]!.triggerId,
            workflowId: workflow.id,
            eventIds: events.map((e) => e.id),
            renderedPrompt: prompt,
            status: "running",
            startedAt: new Date(),
        })
        .returning();

    if (!execution?.id) throw new Error("Failed to create execution record");

    try {
        const result = await executeSession({
            apiKey,
            prompt,
            timeoutMs: SESSION_TIMEOUT_MS,
        });
        await db
            .update(relayExecutions)
            .set({
                aiSessionId: result.sessionId,
                status: "completed",
                output: result.output,
                completedAt: new Date(),
                latencyMs: result.latencyMs,
            })
            .where(eq(relayExecutions.id, execution.id));
        await db
            .update(relayEvents)
            .set({ executionId: execution.id })
            .where(inArray(relayEvents.id, eventIds));
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : String(err);
        await db
            .update(relayExecutions)
            .set({
                status: "failed",
                error: errorMessage,
                completedAt: new Date(),
            })
            .where(eq(relayExecutions.id, execution.id));
    }
}
