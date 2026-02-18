import Mustache from "mustache";

const MAX_PROMPT_LENGTH = 64 * 1024; // 64KB

export function renderPrompt(
    template: string,
    payload: unknown,
    contextInstructions?: string | null,
): string {
    const view = { payload };
    const renderedTask = Mustache.render(template, view);
    const payloadFormatted =
        typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2);
    const parts: string[] = [];
    if (contextInstructions?.trim()) {
        parts.push("[CONTEXT INSTRUCTIONS]\n" + contextInstructions.trim());
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
    const view = { payload };
    return Mustache.render(template, view).replace(/\0/g, "");
}
