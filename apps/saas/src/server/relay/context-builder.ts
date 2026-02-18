import { renderPrompt } from "./template";

export type BuildContextParams = {
    promptTemplate: string;
    contextInstructions: string | null;
    rawPayload: unknown;
    githubRepo: string;
    includePaths: string[];
    excludePaths: string[];
    lowNoiseMode?: boolean;
    triggerId?: string;
};

export function buildDevinPrompt(params: BuildContextParams): string {
    return renderPrompt(
        params.promptTemplate,
        params.rawPayload,
        params.contextInstructions,
        params.githubRepo,
        params.includePaths,
        params.excludePaths,
        {
            lowNoiseMode: params.lowNoiseMode,
            triggerId: params.triggerId,
        },
    );
}
