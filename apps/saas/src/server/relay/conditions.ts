import { db } from "@/server/db";
import { relayEvents } from "@/server/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export type Condition = {
    path: string;
    operator: string;
    value: unknown;
};

const OPERATORS = [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "exists",
] as const;

function getAtPath(obj: unknown, path: string): unknown {
    const parts = path.replace(/^payload\.?/, "").split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return current;
}

function evaluateCondition(
    payload: unknown,
    condition: Condition,
): boolean {
    const { path, operator, value } = condition;
    const actual = getAtPath(payload, path);

    switch (operator) {
        case "eq":
            return actual === value;
        case "neq":
            return actual !== value;
        case "gt":
            return typeof actual === "number" && typeof value === "number" && actual > value;
        case "gte":
            return typeof actual === "number" && typeof value === "number" && actual >= value;
        case "lt":
            return typeof actual === "number" && typeof value === "number" && actual < value;
        case "lte":
            return typeof actual === "number" && typeof value === "number" && actual <= value;
        case "contains":
            return typeof actual === "string" && typeof value === "string" && actual.includes(value);
        case "exists":
            if (value === true) return actual !== undefined && actual !== null;
            if (value === false) return actual === undefined || actual === null;
            return actual !== undefined && actual !== null;
        default:
            return false;
    }
}

export function evaluateConditions(
    payload: unknown,
    conditions: Condition[],
): boolean {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every((c) => evaluateCondition(payload, c));
}

export type ThresholdConfig = {
    count: number;
    windowMinutes: number;
} | null;

export async function checkThreshold(
    triggerId: string,
    config: ThresholdConfig,
): Promise<boolean> {
    if (!config || config.count <= 0 || config.windowMinutes <= 0) {
        return true;
    }
    const since = new Date(Date.now() - config.windowMinutes * 60 * 1000);
    const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(relayEvents)
        .where(
            and(
                eq(relayEvents.triggerId, triggerId),
                gte(relayEvents.receivedAt, since),
            ),
        );
    const count = result[0]?.count ?? 0;
    return count >= config.count;
}
