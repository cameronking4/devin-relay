const DEVIN_API_BASE = "https://api.devin.ai/v1";

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
            messages?: Array<{ content?: string; role?: string }>;
            structured_output?: unknown;
        };

        // Check for completion statuses: "stopped" or "blocked" (per Devin API docs)
        if (data.status_enum === "stopped" || data.status_enum === "blocked") {
            if (data.messages?.length) {
                const last = data.messages[data.messages.length - 1];
                output = last?.content ?? "";
            }
            if (data.structured_output != null) {
                output =
                    output ||
                    (typeof data.structured_output === "string"
                        ? data.structured_output
                        : JSON.stringify(data.structured_output));
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
