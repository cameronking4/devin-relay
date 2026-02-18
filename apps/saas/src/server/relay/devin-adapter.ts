const DEVIN_API_BASE = "https://api.devin.ai/v1";

/** Thrown when Devin API returns 429 (concurrent session limit, rate limit, etc.) */
export class DevinRateLimitError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly detail?: string,
    ) {
        super(message);
        this.name = "DevinRateLimitError";
    }
}

export type ExecuteSessionParams = {
    apiKey: string;
    prompt: string;
    metadata?: Record<string, unknown>;
    timeoutMs?: number;
};

export type ExecuteSessionResult = {
    sessionId: string;
    output: string;
    latencyMs: number;
};

export async function executeSession(
    params: ExecuteSessionParams,
): Promise<ExecuteSessionResult> {
    const { apiKey, prompt, timeoutMs = 600_000 } = params;
    const start = Date.now();

    const createRes = await fetch(`${DEVIN_API_BASE}/sessions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
    });

    if (!createRes.ok) {
        const err = (await createRes.text()) || createRes.statusText;
        if (createRes.status === 429) {
            let detail: string | undefined;
            try {
                const parsed = JSON.parse(err) as { detail?: string };
                detail = parsed.detail;
            } catch {
                /* ignore */
            }
            throw new DevinRateLimitError(
                `Devin concurrent session limit: ${detail ?? err}`,
                createRes.status,
                detail,
            );
        }
        throw new Error(`Devin create session failed: ${createRes.status} ${err}`);
    }

    const { session_id: sessionId } = (await createRes.json()) as {
        session_id: string;
    };

    const pollIntervalMs = 2000;
    const maxAttempts = Math.ceil(timeoutMs / pollIntervalMs);
    let attempts = 0;
    let output = "";
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        attempts++;

        const getRes = await fetch(`${DEVIN_API_BASE}/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        // Handle transient gateway errors (502, 503, 504) with retry
        if (!getRes.ok) {
            const status = getRes.status;
            const isTransientError = status === 502 || status === 503 || status === 504;
            
            if (isTransientError) {
                consecutiveErrors++;
                if (consecutiveErrors >= maxConsecutiveErrors) {
                    throw new Error(
                        `Devin get session failed after ${maxConsecutiveErrors} retries: ${status} ${await getRes.text()}`,
                    );
                }
                // Retry with exponential backoff
                await new Promise((r) => setTimeout(r, pollIntervalMs * consecutiveErrors));
                continue;
            }
            
            // For non-transient errors, fail immediately
            throw new Error(
                `Devin get session failed: ${status} ${await getRes.text()}`,
            );
        }

        consecutiveErrors = 0; // Reset on success

        const data = (await getRes.json()) as {
            status_enum?: string;
            output?: string;
            messages?: Array<{ content?: string; role?: string }>;
            structured_output?: unknown;
        };

        // Terminal statuses per Devin v1 API: finished, blocked, stopped, expired
        const isTerminal =
            data.status_enum === "finished" ||
            data.status_enum === "stopped" ||
            data.status_enum === "blocked" ||
            data.status_enum === "expired";

        if (isTerminal) {
            // Prefer top-level output (some API versions return this directly)
            if (typeof data.output === "string" && data.output.trim()) {
                output = data.output;
            }
            // Fallback: structured_output
            if (!output && data.structured_output != null) {
                output =
                    typeof data.structured_output === "string"
                        ? data.structured_output
                        : JSON.stringify(data.structured_output);
            }
            // Fallback: last assistant message content
            if (!output && data.messages?.length) {
                const assistantMessages = data.messages.filter(
                    (m) => m.role === "assistant" && m.content,
                );
                const last = assistantMessages[assistantMessages.length - 1];
                output = last?.content ?? "";
            }
            // Fallback: concatenate all assistant messages for fuller output
            if (!output && data.messages?.length) {
                output = data.messages
                    .filter((m) => m.role === "assistant" && m.content)
                    .map((m) => m.content)
                    .join("\n\n");
            }
            break;
        }
    }

    const latencyMs = Date.now() - start;
    return { sessionId, output, latencyMs };
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    const res = await fetch(`${DEVIN_API_BASE}/sessions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
}
