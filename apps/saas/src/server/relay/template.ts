import Mustache from "mustache";

const MAX_PROMPT_LENGTH = 64 * 1024; // 64KB

/** Sanitize trigger ID for use in branch names (alphanumeric, hyphen) */
function sanitizeBranchSuffix(id: string): string {
    return id.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 63);
}

/**
 * Wrap a payload object so that Mustache interpolation (`{{payload}}`) produces
 * a JSON string instead of `[object Object]`, while nested access like
 * `{{payload.field}}` keeps working.
 */
function wrapPayloadForMustache(payload: unknown): unknown {
    if (payload == null || typeof payload !== "object") return payload;
    const wrapped = { ...(payload as Record<string, unknown>) };
    Object.defineProperty(wrapped, "toString", {
        value: () => JSON.stringify(payload, null, 2),
        enumerable: false,
        configurable: true,
    });
    return wrapped;
}

/** Format payload for [EVENT DATA] section; supports single object, batch { events, count }, or workflow { sources, summary }. */
function formatPayloadForEventData(payload: unknown): string {
    if (typeof payload === "string") {
        return payload;
    }
    const obj = payload as Record<string, unknown>;
    const batch = obj as { events?: Array<{ receivedAt?: string; payload?: unknown }>; count?: number };
    if (
        batch &&
        Array.isArray(batch.events) &&
        batch.events.length > 0
    ) {
        const sources = obj.sources as Record<string, Array<{ receivedAt?: string; payload?: unknown }>> | undefined;
        if (sources && typeof sources === "object" && Object.keys(sources).length > 0) {
            return Object.entries(sources)
                .map(([sourceName, events]) => {
                    const block = events
                        .map((ev, i) => {
                            const label = ev.receivedAt
                                ? `Event ${i + 1} (${ev.receivedAt})`
                                : `Event ${i + 1}`;
                            const body =
                                typeof ev.payload === "string"
                                    ? ev.payload
                                    : JSON.stringify(ev.payload ?? {}, null, 2);
                            return `${label}:\n${body}`;
                        })
                        .join("\n\n");
                    return `[${sourceName}]\n${block}`;
                })
                .join("\n\n");
        }
        return batch.events
            .map((ev, i) => {
                const label = ev.receivedAt
                    ? `Event ${i + 1} (${ev.receivedAt})`
                    : `Event ${i + 1}`;
                const body =
                    typeof ev.payload === "string"
                        ? ev.payload
                        : JSON.stringify(ev.payload ?? {}, null, 2);
                return `${label}:\n${body}`;
            })
            .join("\n\n");
    }
    return JSON.stringify(payload, null, 2);
}

/** Build [EVENT SUMMARY] section when payload has summary or window metadata (workflows). */
function formatEventSummary(payload: unknown): string | null {
    if (payload == null || typeof payload !== "object") return null;
    const obj = payload as Record<string, unknown>;
    const summary = obj.summary as string | undefined;
    const windowStart = obj.windowStart as string | undefined;
    const windowEnd = obj.windowEnd as string | undefined;
    const parts: string[] = [];
    if (summary) parts.push(summary);
    if (windowStart && windowEnd) parts.push(`Window: ${windowStart} – ${windowEnd} UTC`);
    if (parts.length === 0) return null;
    return parts.join("\n");
}

export function renderPrompt(
    template: string,
    payload: unknown,
    contextInstructions?: string | null,
    githubRepo?: string,
    includePaths: string[] = [],
    excludePaths: string[] = [],
    options?: { lowNoiseMode?: boolean; triggerId?: string },
): string {
    const view = { payload: wrapPayloadForMustache(payload) };
    const renderedTask = Mustache.render(template, view);
    const payloadFormatted = formatPayloadForEventData(payload);
    const parts: string[] = [];
    if (githubRepo?.trim()) {
        const repoUrl = `https://github.com/${githubRepo.trim()}`;
        parts.push(
            `[REPOSITORY]\nWork in this repository: ${githubRepo.trim()}\n${repoUrl}\n\nDevin: @${githubRepo.trim()}`,
        );
    }
    if (options?.lowNoiseMode && options?.triggerId) {
        const branchName = `relay/${sanitizeBranchSuffix(options.triggerId)}`;
        parts.push(
            `[GIT STRATEGY]\nUse exactly one branch per trigger: ${branchName}. One PR at a time.\n- If an open PR from you already exists for this repository, add your changes to that branch. Do not create a new PR.\n- If not: git checkout main && git pull && git checkout -b ${branchName}, make changes, push, open one PR.\n- Pull latest main before pushing. Never open multiple PRs for related work—consolidate into one.`,
        );
    }
    const inc = includePaths.filter((p) => p?.trim()).map((p) => p.trim());
    const exc = excludePaths.filter((p) => p?.trim()).map((p) => p.trim());
    if (inc.length > 0 || exc.length > 0) {
        const pathRules: string[] = [];
        if (inc.length > 0) {
            pathRules.push(
                `Only work within these paths: ${inc.join(", ")}. Do not create or modify files outside these paths.`,
            );
        }
        if (exc.length > 0) {
            pathRules.push(
                `Do not create, read, or modify files in these paths: ${exc.join(", ")}.`,
            );
        }
        parts.push("[PATH POLICY]\n" + pathRules.join("\n"));
    }
    if (contextInstructions?.trim()) {
        parts.push("[CONTEXT INSTRUCTIONS]\n" + contextInstructions.trim());
    }
    const eventSummary = formatEventSummary(payload);
    if (eventSummary) {
        parts.push("[EVENT SUMMARY]\n" + eventSummary);
    }
    parts.push("[EVENT DATA]\n```json\n" + payloadFormatted + "\n```");
    parts.push("[TASK]\n" + renderedTask);
    const full = parts.join("\n\n");
    if (full.length > MAX_PROMPT_LENGTH) {
        return full.slice(0, MAX_PROMPT_LENGTH) + "\n\n... (truncated)";
    }
    return full.replace(/\0/g, "");
}

export function renderTemplateOnly(
    template: string,
    payload: unknown,
): string {
    const view = { payload: wrapPayloadForMustache(payload) };
    return Mustache.render(template, view).replace(/\0/g, "");
}
