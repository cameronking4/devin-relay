import { db } from "@/server/db";
import {
    relayEvents,
    relayExecutions,
    relayProjects,
    relayTriggers,
} from "@/server/db/schema";
import { buildDevinPrompt } from "@/server/relay/context-builder";
import { decrypt } from "@/server/relay/encryption";
import { executeSession } from "@/server/relay/devin-adapter";
import { env } from "@/env";
import { and, eq, gte, sql } from "drizzle-orm";

const SESSION_TIMEOUT_MS = 600_000; // 10 min

export async function processExecutionJob(eventId: string): Promise<void> {
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
        await db
            .insert(relayExecutions)
            .values({
                eventId: event.id,
                projectId: project.id,
                triggerId: trigger.id,
                status: "failed",
                error: `Daily cap (${trigger.dailyCap}) reached`,
            });
        return;
    }

    if (!project.devinApiKeyEncrypted || !env.RELAY_ENCRYPTION_KEY) {
        await db
            .insert(relayExecutions)
            .values({
                eventId: event.id,
                projectId: project.id,
                triggerId: trigger.id,
                status: "failed",
                error: "Project has no Devin API key configured",
            });
        return;
    }

    const apiKey = decrypt(project.devinApiKeyEncrypted, env.RELAY_ENCRYPTION_KEY);
    const prompt = buildDevinPrompt({
        promptTemplate: trigger.promptTemplate,
        contextInstructions: project.contextInstructions,
        rawPayload: event.rawPayload,
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
