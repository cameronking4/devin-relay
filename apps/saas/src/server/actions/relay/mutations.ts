"use server";

import { getOrganizations } from "@/server/actions/organization/queries";
import { getRelayProjectById } from "@/server/actions/relay/queries";
import { db } from "@/server/db";
import { relayProjects, relayTriggers } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/server/relay/encryption";
import { env } from "@/env";
import { siteUrls } from "@/config/urls";
import { validateApiKey } from "@/server/relay/devin-adapter";

export type TriggerConditions = { path: string; operator: string; value: unknown }[];
export type TriggerThresholdConfig = { count: number; windowMinutes: number } | null;
export type PathPolicyPaths = string[];

export async function createRelayProject(name: string) {
    await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) throw new Error("No organization selected");

    const [project] = await db
        .insert(relayProjects)
        .values({
            orgId: currentOrg.id,
            name: name.trim().slice(0, 255),
        })
        .returning();
    if (!project) throw new Error("Failed to create project");
    revalidatePath(siteUrls.relay.projects);
    return project;
}

export async function updateRelayProjectDevinKey(
    projectId: string,
    apiKey: string,
) {
    await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) throw new Error("No organization selected");
    if (!env.RELAY_ENCRYPTION_KEY) throw new Error("Encryption not configured");

    const encrypted = encrypt(apiKey, env.RELAY_ENCRYPTION_KEY);
    await db
        .update(relayProjects)
        .set({ devinApiKeyEncrypted: encrypted })
        .where(
            and(
                eq(relayProjects.id, projectId),
                eq(relayProjects.orgId, currentOrg.id),
            ),
        );
    revalidatePath(siteUrls.relay.projects);
    revalidatePath(siteUrls.relay.project(projectId));
}

export async function updateRelayProjectContextInstructions(
    projectId: string,
    contextInstructions: string | null,
) {
    await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) throw new Error("No organization selected");

    await db
        .update(relayProjects)
        .set({ contextInstructions: contextInstructions?.trim() ?? null })
        .where(
            and(
                eq(relayProjects.id, projectId),
                eq(relayProjects.orgId, currentOrg.id),
            ),
        );
    revalidatePath(siteUrls.relay.project(projectId));
}

export async function createRelayTrigger(
    projectId: string,
    data: {
        name: string;
        source: string;
        eventType: string;
        githubRepo: string;
        promptTemplate: string;
        conditions?: TriggerConditions;
        thresholdConfig?: TriggerThresholdConfig;
        concurrencyLimit?: number;
        dailyCap?: number;
        includePaths?: PathPolicyPaths;
        excludePaths?: PathPolicyPaths;
    },
) {
    await protectedProcedure();
    const project = await getRelayProjectById(projectId);
    const { currentOrg } = await getOrganizations();
    if (!currentOrg || !project || project.orgId !== currentOrg.id) {
        throw new Error("Project not found");
    }

    const [trigger] = await db
        .insert(relayTriggers)
        .values({
            projectId,
            name: data.name.trim().slice(0, 255),
            source: data.source,
            eventType: data.eventType.trim().slice(0, 255),
            githubRepo: data.githubRepo.trim().slice(0, 255),
            promptTemplate: data.promptTemplate,
            conditions: data.conditions ?? [],
            thresholdConfig: data.thresholdConfig ?? null,
            concurrencyLimit: data.concurrencyLimit ?? 3,
            dailyCap: data.dailyCap ?? 50,
            includePaths: data.includePaths ?? [],
            excludePaths: data.excludePaths ?? [],
        })
        .returning();
    if (!trigger) throw new Error("Failed to create trigger");
    revalidatePath(siteUrls.relay.project(projectId));
    revalidatePath(siteUrls.relay.triggers(projectId));
    return trigger;
}

export async function updateRelayTrigger(
    projectId: string,
    triggerId: string,
    data: {
        name?: string;
        source?: string;
        eventType?: string;
        githubRepo?: string;
        promptTemplate?: string;
        conditions?: TriggerConditions;
        thresholdConfig?: TriggerThresholdConfig;
        concurrencyLimit?: number;
        dailyCap?: number;
        includePaths?: PathPolicyPaths;
        excludePaths?: PathPolicyPaths;
    },
) {
    await protectedProcedure();
    const project = await getRelayProjectById(projectId);
    const { currentOrg } = await getOrganizations();
    if (!currentOrg || !project || project.orgId !== currentOrg.id) {
        throw new Error("Project not found");
    }

    await db
        .update(relayTriggers)
        .set({
            ...(data.name !== undefined && {
                name: data.name.trim().slice(0, 255),
            }),
            ...(data.source !== undefined && { source: data.source }),
            ...(data.eventType !== undefined && {
                eventType: data.eventType.trim().slice(0, 255),
            }),
            ...(data.githubRepo !== undefined && {
                githubRepo: data.githubRepo.trim().slice(0, 255),
            }),
            ...(data.promptTemplate !== undefined && {
                promptTemplate: data.promptTemplate,
            }),
            ...(data.conditions !== undefined && { conditions: data.conditions }),
            ...(data.thresholdConfig !== undefined && {
                thresholdConfig: data.thresholdConfig,
            }),
            ...(data.concurrencyLimit !== undefined && {
                concurrencyLimit: data.concurrencyLimit,
            }),
            ...(data.dailyCap !== undefined && { dailyCap: data.dailyCap }),
            ...(data.includePaths !== undefined && { includePaths: data.includePaths }),
            ...(data.excludePaths !== undefined && { excludePaths: data.excludePaths }),
        })
        .where(
            and(
                eq(relayTriggers.id, triggerId),
                eq(relayTriggers.projectId, projectId),
            ),
        );
    revalidatePath(siteUrls.relay.project(projectId));
    revalidatePath(siteUrls.relay.triggers(projectId));
    revalidatePath(siteUrls.relay.trigger(projectId, triggerId));
}

export async function deleteRelayTrigger(projectId: string, triggerId: string) {
    await protectedProcedure();
    const project = await getRelayProjectById(projectId);
    const { currentOrg } = await getOrganizations();
    if (!currentOrg || !project || project.orgId !== currentOrg.id) {
        throw new Error("Project not found");
    }

    await db
        .delete(relayTriggers)
        .where(
            and(
                eq(relayTriggers.id, triggerId),
                eq(relayTriggers.projectId, projectId),
            ),
        );
    revalidatePath(siteUrls.relay.project(projectId));
    revalidatePath(siteUrls.relay.triggers(projectId));
}

export async function setRelayTriggerEnabled(
    projectId: string,
    triggerId: string,
    enabled: boolean,
) {
    await protectedProcedure();
    const project = await getRelayProjectById(projectId);
    const { currentOrg } = await getOrganizations();
    if (!currentOrg || !project || project.orgId !== currentOrg.id) {
        throw new Error("Project not found");
    }

    await db
        .update(relayTriggers)
        .set({ enabled })
        .where(
            and(
                eq(relayTriggers.id, triggerId),
                eq(relayTriggers.projectId, projectId),
            ),
        );
    revalidatePath(siteUrls.relay.project(projectId));
    revalidatePath(siteUrls.relay.triggers(projectId));
    revalidatePath(siteUrls.relay.trigger(projectId, triggerId));
}

export async function validateStoredDevinKey(projectId: string) {
    await protectedProcedure();
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) return { valid: false };
    if (!env.RELAY_ENCRYPTION_KEY) return { valid: false };

    const [project] = await db
        .select({ devinApiKeyEncrypted: relayProjects.devinApiKeyEncrypted })
        .from(relayProjects)
        .where(
            and(
                eq(relayProjects.id, projectId),
                eq(relayProjects.orgId, currentOrg.id),
            ),
        )
        .limit(1);
    if (!project?.devinApiKeyEncrypted) return { valid: false };
    try {
        const key = decrypt(
            project.devinApiKeyEncrypted,
            env.RELAY_ENCRYPTION_KEY,
        );
        const valid = await validateApiKey(key);
        return { valid };
    } catch {
        return { valid: false };
    }
}
