import Mustache from "mustache";

const MAX_PROMPT_LENGTH = 64 * 1024; // 64KB

export function renderPrompt(
    template: string,
    payload: unknown,
    contextInstructions?: string | null,
    githubRepo?: string,
    includePaths: string[] = [],
    excludePaths: string[] = [],
): string {
    const view = { payload };
    const renderedTask = Mustache.render(template, view);
    const payloadFormatted =
        typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2);
    const parts: string[] = [];
    if (githubRepo?.trim()) {
        const repoUrl = `https://github.com/${githubRepo.trim()}`;
        parts.push(
            `[REPOSITORY]\nWork in this repository: ${githubRepo.trim()}\n${repoUrl}\n\nDevin: @${githubRepo.trim()}`,
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
