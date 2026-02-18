import { renderPrompt } from "./template";

export type BuildContextParams = {
    promptTemplate: string;
    contextInstructions: string | null;
    rawPayload: unknown;
};

export function buildDevinPrompt(params: BuildContextParams): string {
    return renderPrompt(
        params.promptTemplate,
        params.rawPayload,
        params.contextInstructions,
    );
}
