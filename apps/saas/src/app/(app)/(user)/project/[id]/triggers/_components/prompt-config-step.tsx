"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PromptEditor } from "./prompt-editor";
import { DevinPromptPreview } from "./devin-prompt-preview";
import { getRecentEventsForTrigger } from "@/server/actions/relay/queries";
import { inferPayloadPaths } from "@/lib/payload-paths";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function PromptConfigStep({
    value,
    onChange,
    projectId,
    triggerId,
    githubRepo,
    includePaths,
    excludePaths,
    lowNoiseMode = false,
    onLowNoiseModeChange,
}: {
    value: string;
    onChange: (value: string) => void;
    projectId?: string;
    triggerId?: string;
    githubRepo?: string;
    includePaths?: string[];
    excludePaths?: string[];
    lowNoiseMode?: boolean;
    onLowNoiseModeChange?: (enabled: boolean) => void;
}) {
    const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);
    const [samplePayload, setSamplePayload] = useState<unknown>(undefined);

    useEffect(() => {
        if (!triggerId || !projectId) return;
        let cancelled = false;
        getRecentEventsForTrigger(triggerId, projectId, 5)
            .then((events) => {
                if (cancelled) return;
                const payloads = events
                    .map((e) => e.rawPayload)
                    .filter(
                        (p): p is Record<string, unknown> =>
                            p != null && typeof p === "object",
                    );
                setSuggestedPaths(inferPayloadPaths(payloads));
                setSamplePayload(payloads[0] ?? undefined);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [triggerId, projectId]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Prompt Configuration</CardTitle>
                    <CardDescription>
                        Write the prompt that tells Devin what to do.
                        {suggestedPaths.length > 0 ? (
                            <>
                                {" "}
                                Use variables from recent events below, or type{" "}
                                <code className="bg-muted rounded px-1">
                                    {"{{payload.field}}"}
                                </code>{" "}
                                manually.
                            </>
                        ) : (
                            <>
                                {" "}
                                Use{" "}
                                <code className="bg-muted rounded px-1">
                                    {"{{payload.field}}"}
                                </code>{" "}
                                to include webhook data. Send a test webhook
                                first to see inferred variables.
                            </>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {onLowNoiseModeChange != null && (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="lowNoiseMode"
                                    checked={lowNoiseMode}
                                    onCheckedChange={(checked) =>
                                        onLowNoiseModeChange(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="lowNoiseMode"
                                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Single branch / low noise mode
                                </Label>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Devin will use branch{" "}
                                <code className="rounded bg-muted px-1">
                                    relay/&#123;triggerId&#125;
                                </code>
                                , update existing PRs instead of creating new
                                ones, and run one execution at a time per
                                trigger.
                            </p>
                        </div>
                    )}
                    <PromptEditor
                        value={value}
                        onChange={onChange}
                        suggestedPaths={suggestedPaths}
                    />
                </CardContent>
            </Card>

            {projectId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Final prompt sent to Devin</CardTitle>
                        <CardDescription>
                            The full prompt including context, repo, and path
                            policy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DevinPromptPreview
                            projectId={projectId}
                            promptTemplate={value}
                            githubRepo={githubRepo ?? ""}
                            includePaths={includePaths ?? []}
                            excludePaths={excludePaths ?? []}
                            samplePayload={samplePayload}
                            embedded
                            lowNoiseMode={lowNoiseMode}
                            triggerId={triggerId}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
