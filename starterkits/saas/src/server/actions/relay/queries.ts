"use server";

import { getOrganizations } from "@/server/actions/organization/queries";
import { db } from "@/server/db";
import {
    relayEvents,
    relayExecutions,
    relayProjects,
    relayTriggers,
} from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { and, desc, eq, gte, sql } from "drizzle-orm";

export async function getRelayProjects() {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return [];

    return db.query.relayProjects.findMany({
        where: eq(relayProjects.orgId, currentOrg.id),
        orderBy: desc(relayProjects.createdAt),
        columns: {
            id: true,
            name: true,
            orgId: true,
            contextInstructions: true,
            createdAt: true,
        },
    });
}

export async function getRelayProjectById(projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return null;

    const [project] = await db
        .select()
        .from(relayProjects)
        .where(
            and(
                eq(relayProjects.id, projectId),
                eq(relayProjects.orgId, currentOrg.id),
            ),
        )
        .limit(1);
    return project ?? null;
}

/** For dashboard overview: never expose encrypted key to client. */
export async function getRelayProjectForOverview(projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return null;

    const [row] = await db
        .select({
            id: relayProjects.id,
            name: relayProjects.name,
            contextInstructions: relayProjects.contextInstructions,
            hasDevinKey: sql<boolean>`(${relayProjects.devinApiKeyEncrypted} IS NOT NULL AND ${relayProjects.devinApiKeyEncrypted} != '')`,
        })
        .from(relayProjects)
        .where(
            and(
                eq(relayProjects.id, projectId),
                eq(relayProjects.orgId, currentOrg.id),
            ),
        )
        .limit(1);
    return row ?? null;
}

export async function getProjectStats(projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return { triggerCount: 0, executionsToday: 0, lastExecution: null };

    const [triggers] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(relayTriggers)
        .where(eq(relayTriggers.projectId, projectId));
    const triggerCount = triggers?.count ?? 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [execToday] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(relayExecutions)
        .where(
            and(
                eq(relayExecutions.projectId, projectId),
                gte(relayExecutions.createdAt, today),
            ),
        );
    const executionsToday = execToday?.count ?? 0;

    const [last] = await db
        .select({ createdAt: relayExecutions.createdAt })
        .from(relayExecutions)
        .where(eq(relayExecutions.projectId, projectId))
        .orderBy(desc(relayExecutions.createdAt))
        .limit(1);
    const lastExecution = last?.createdAt ?? null;

    return { triggerCount, executionsToday, lastExecution };
}

export async function getTriggersByProjectId(projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return [];

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return [];

    const triggers = await db.query.relayTriggers.findMany({
        where: eq(relayTriggers.projectId, projectId),
        orderBy: desc(relayTriggers.createdAt),
        columns: {
            id: true,
            name: true,
            source: true,
            eventType: true,
            conditions: true,
            thresholdConfig: true,
            enabled: true,
            concurrencyLimit: true,
            dailyCap: true,
            promptTemplate: true,
            createdAt: true,
        },
    });

    if (triggers.length === 0) return [];

    const lastEvents = await db
        .select({
            triggerId: relayEvents.triggerId,
            lastTriggeredAt: sql<Date>`max(${relayEvents.receivedAt})`,
        })
        .from(relayEvents)
        .where(eq(relayEvents.projectId, projectId))
        .groupBy(relayEvents.triggerId);

    const lastByTrigger = new Map(
        lastEvents.map((r) => [r.triggerId, r.lastTriggeredAt]),
    );

    return triggers.map((t) => ({
        ...t,
        lastTriggeredAt: lastByTrigger.get(t.id) ?? null,
    }));
}

export async function getTriggerById(triggerId: string, projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return null;

    const [trigger] = await db
        .select()
        .from(relayTriggers)
        .where(
            and(
                eq(relayTriggers.id, triggerId),
                eq(relayTriggers.projectId, projectId),
            ),
        )
        .limit(1);
    if (!trigger) return null;

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return null;
    return trigger;
}

export async function getExecutionsByProjectId(
    projectId: string,
    opts?: { status?: string; triggerId?: string; limit?: number },
) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return [];

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return [];

    const limit = opts?.limit ?? 50;
    const conditions = [eq(relayExecutions.projectId, projectId)];
    if (opts?.status) {
        conditions.push(eq(relayExecutions.status, opts.status as "pending" | "running" | "completed" | "failed"));
    }
    if (opts?.triggerId) {
        conditions.push(eq(relayExecutions.triggerId, opts.triggerId));
    }

    return db
        .select({
            id: relayExecutions.id,
            eventId: relayExecutions.eventId,
            projectId: relayExecutions.projectId,
            triggerId: relayExecutions.triggerId,
            status: relayExecutions.status,
            latencyMs: relayExecutions.latencyMs,
            startedAt: relayExecutions.startedAt,
            createdAt: relayExecutions.createdAt,
            triggerName: relayTriggers.name,
        })
        .from(relayExecutions)
        .innerJoin(
            relayTriggers,
            eq(relayExecutions.triggerId, relayTriggers.id),
        )
        .where(and(...conditions))
        .orderBy(desc(relayExecutions.createdAt))
        .limit(limit);
}

export async function getExecutionById(executionId: string, projectId: string) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return null;

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return null;

    const [exec] = await db
        .select()
        .from(relayExecutions)
        .where(
            and(
                eq(relayExecutions.id, executionId),
                eq(relayExecutions.projectId, projectId),
            ),
        )
        .limit(1);
    if (!exec) return null;

    const [event] = await db
        .select({ rawPayload: relayEvents.rawPayload })
        .from(relayEvents)
        .where(eq(relayEvents.id, exec.eventId))
        .limit(1);

    const [trigger] = await db
        .select({ name: relayTriggers.name })
        .from(relayTriggers)
        .where(eq(relayTriggers.id, exec.triggerId))
        .limit(1);

    return {
        ...exec,
        rawPayload: event?.rawPayload ?? null,
        triggerName: trigger?.name ?? null,
    };
}

export async function getRecentEventsForTrigger(
    triggerId: string,
    projectId: string,
    limit: number = 5,
) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return [];

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return [];

    return db
        .select({
            id: relayEvents.id,
            rawPayload: relayEvents.rawPayload,
            receivedAt: relayEvents.receivedAt,
        })
        .from(relayEvents)
        .where(
            and(
                eq(relayEvents.triggerId, triggerId),
                eq(relayEvents.projectId, projectId),
            ),
        )
        .orderBy(desc(relayEvents.receivedAt))
        .limit(limit);
}

export async function getWebhookActivity(
    triggerId: string,
    projectId: string,
) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return null;

    const project = await getRelayProjectById(projectId);
    if (!project || project.orgId !== currentOrg.id) return null;

    const [stats] = await db
        .select({
            totalEvents: sql<number>`count(*)::int`,
            lastReceivedAt: sql<Date | null>`max(${relayEvents.receivedAt})`,
        })
        .from(relayEvents)
        .where(
            and(
                eq(relayEvents.triggerId, triggerId),
                eq(relayEvents.projectId, projectId),
            ),
        );

    return {
        totalEvents: stats?.totalEvents ?? 0,
        lastReceivedAt: stats?.lastReceivedAt ?? null,
    };
}
