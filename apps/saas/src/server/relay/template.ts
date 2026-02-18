import Mustache from "mustache";

const MAX_PROMPT_LENGTH = 64 * 1024; // 64KB

/** Sanitize trigger ID for use in branch names (alphanumeric, hyphen) */
function sanitizeBranchSuffix(id: string): string {
    return id.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 63);
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
