"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { previewDevinPrompt } from "@/server/actions/relay/queries";
import { Icons } from "@/components/ui/icons";

export function DevinPromptPreview({
    projectId,
    promptTemplate,
    githubRepo,
    includePaths,
    excludePaths,
    samplePayload,
    embedded = false,
    lowNoiseMode,
    triggerId,
}: {
    projectId: string;
    promptTemplate: string;
    githubRepo: string;
    includePaths: string[];
    excludePaths: string[];
    /** Optional payload from recent test connection for realistic preview */
    samplePayload?: unknown;
    /** When true, render content without accordion (for single-preview layouts) */
    embedded?: boolean;
    /** When true, injects GIT STRATEGY for single-branch workflow */
    lowNoiseMode?: boolean;
    /** Used for branch name relay/{triggerId} in low noise mode */
    triggerId?: string;
}) {
    const [prompt, setPrompt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchPreview = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await previewDevinPrompt({
                projectId,
                promptTemplate,
                githubRepo,
                includePaths: includePaths ?? [],
                excludePaths: excludePaths ?? [],
                samplePayload,
                lowNoiseMode,
                triggerId,
            });
            if ("error" in result) {
                setError(result.error);
                setPrompt(null);
            } else {
                setPrompt(result.prompt);
                setError(null);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
            setPrompt(null);
        } finally {
            setLoading(false);
        }
    }, [
        projectId,
        promptTemplate,
        githubRepo,
        includePaths,
        excludePaths,
        samplePayload,
        lowNoiseMode,
        triggerId,
    ]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    const content = (
        <>
            {error && (
                <p className="text-destructive mb-2 text-sm">{error}</p>
            )}
            {prompt && !error && (
                <div className="bg-muted max-h-[400px] overflow-auto rounded-md p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                        {prompt}
                    </pre>
                </div>
            )}
            {!prompt && !error && !loading && (
                <p className="text-muted-foreground text-sm">
                    Configure trigger to see the full prompt.
                </p>
            )}
        </>
    );

    if (embedded) {
        return (
            <div className="w-full">
                {loading && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.loader className="h-4 w-4 animate-spin" />
                        Loading…
                    </div>
                )}
                {content}
            </div>
        );
    }

    return (
        <Accordion
            type="single"
            collapsible
            defaultValue="full-prompt"
            className="w-full"
        >
            <AccordionItem value="full-prompt" className="border-none">
                <AccordionTrigger className="hover:no-underline">
                    <span className="font-medium">
                        Final prompt sent to Devin
                    </span>
                    {loading && (
                        <Icons.loader className="ml-2 h-4 w-4 animate-spin" />
                    )}
                </AccordionTrigger>
                <AccordionContent>{content}</AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
