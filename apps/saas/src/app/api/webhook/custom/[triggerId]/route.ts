import { db } from "@/server/db";
import { relayEvents, relayTriggers } from "@/server/db/schema";
import {
    evaluateConditions,
    type Condition,
    type ThresholdConfig,
} from "@/server/relay/conditions";
import { executionQueue } from "@/server/relay/queue";
import { evaluateWorkflowsOnNewEvent } from "@/server/relay/workflow-engine";
import { and, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as crypto from "node:crypto";

const MAX_PAYLOAD_BYTES = 512 * 1024; // 512KB

type RouteContext = { params: Promise<{ triggerId: string }> };

export const dynamic = "force-dynamic";

export async function POST(
    request: Request,
    context: RouteContext,
): Promise<NextResponse> {
    const { triggerId } = await context.params;

    let body: string;
    try {
        const buffer = await request.arrayBuffer();
        body = new TextDecoder().decode(buffer);
    } catch {
        return NextResponse.json(
            { error: "Invalid body" },
            { status: 400 },
        );
    }

    if (body.length > MAX_PAYLOAD_BYTES) {
        return NextResponse.json(
            { error: "Payload too large" },
            { status: 413 },
        );
    }

    const contentType = request.headers.get("Content-Type") ?? "";
    const isFormEncoded =
        contentType.includes("application/x-www-form-urlencoded");

    let rawPayload: string;
    if (isFormEncoded) {
        const params = new URLSearchParams(body);
        const payloadParam = params.get("payload");
        if (!payloadParam) {
            return NextResponse.json(
                { error: "Missing payload in form body" },
                { status: 400 },
            );
        }
        rawPayload = payloadParam;
    } else {
        rawPayload = body.trim();
        if (!rawPayload) {
            return NextResponse.json(
                { error: "Empty body" },
                { status: 400 },
            );
        }
    }

    let payload: unknown;
    try {
        payload = JSON.parse(rawPayload) as unknown;
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON" },
            { status: 400 },
        );
    }

    const deliveryId =
        request.headers.get("X-Relay-Delivery-Id") ??
        request.headers.get("X-GitHub-Delivery") ??
        crypto.createHash("sha256").update(rawPayload).digest("hex");

    const triggers = await db
        .select()
        .from(relayTriggers)
        .where(eq(relayTriggers.id, triggerId))
        .limit(1);

    const trigger = triggers[0];
    if (!trigger) {
        return NextResponse.json({ error: "Trigger not found" }, { status: 404 });
    }
    if (!trigger.enabled) {
        return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    const ABANDONMENT_MS = 15 * 60 * 1000; // 15 minutes
    const setupComplete = (trigger as { setupComplete?: boolean }).setupComplete ?? true;
    const isAbandoned =
        !setupComplete &&
        Date.now() - trigger.createdAt.getTime() > ABANDONMENT_MS;
    if (isAbandoned) {
        await db
            .update(relayTriggers)
            .set({ setupComplete: true })
            .where(
                and(
                    eq(relayTriggers.id, triggerId),
                    eq(relayTriggers.projectId, trigger.projectId),
                ),
            );
    }
    const shouldExecute = setupComplete || isAbandoned;
    // Events are always stored below (for connection testing and payload autofill in the wizard).
    // We only skip queueing Devin execution when !shouldExecute.

    const existing = await db
        .select({ id: relayEvents.id })
        .from(relayEvents)
        .where(
            and(
                eq(relayEvents.triggerId, triggerId),
                eq(relayEvents.deliveryId, deliveryId),
            ),
        )
        .limit(1);
    if (existing.length > 0) {
        return NextResponse.json({ status: "ok", eventId: existing[0]!.id }, { status: 200 });
    }

    const conditions = (trigger.conditions ?? []) as Condition[];
    if (!evaluateConditions(payload, conditions)) {
        return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    const [event] = await db
        .insert(relayEvents)
        .values({
            projectId: trigger.projectId,
            triggerId: trigger.id,
            deliveryId,
            rawPayload: payload as Record<string, unknown>,
        })
        .returning({ id: relayEvents.id });

    if (!event?.id) {
        return NextResponse.json(
            { error: "Failed to store event" },
            { status: 500 },
        );
    }

    const thresholdConfig = trigger.thresholdConfig as ThresholdConfig | null;
    const windowMinutes = thresholdConfig?.windowMinutes ?? 5;

    if (thresholdConfig?.count != null && thresholdConfig.count > 0) {
        const since = new Date(
            Date.now() - windowMinutes * 60 * 1000,
        );
        const countResult = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(relayEvents)
            .where(
                and(
                    eq(relayEvents.triggerId, triggerId),
                    gte(relayEvents.receivedAt, since),
                ),
            );
        const count = countResult[0]?.count ?? 0;
        if (count < thresholdConfig.count) {
            if (shouldExecute) {
                await evaluateWorkflowsOnNewEvent({
                    projectId: trigger.projectId,
                    triggerId: trigger.id,
                });
            }
            return NextResponse.json({ status: "ok", eventId: event.id }, { status: 200 });
        }

        const windowEnd = new Date();
        const bucket = Math.floor(
            Date.now() / (windowMinutes * 60 * 1000),
        );
        const jobId = `batch-${triggerId}-${bucket}`.slice(0, 100);
        if (shouldExecute) {
            await executionQueue.add(
                "execute-batch",
                {
                    kind: "batch",
                    triggerId,
                    windowStart: since.toISOString(),
                    windowEnd: windowEnd.toISOString(),
                },
                { jobId },
            );
            await evaluateWorkflowsOnNewEvent({
                projectId: trigger.projectId,
                triggerId: trigger.id,
            });
        }
        return NextResponse.json({ status: "ok", eventId: event.id }, { status: 200 });
    }

    if (shouldExecute) {
        await executionQueue.add(
            "execute",
            {
                kind: "single",
                eventId: event.id,
            },
            { jobId: `${triggerId}-${deliveryId}`.slice(0, 100) },
        );
        await evaluateWorkflowsOnNewEvent({
            projectId: trigger.projectId,
            triggerId: trigger.id,
        });
    }

    return NextResponse.json({ status: "ok", eventId: event.id }, { status: 200 });
}
