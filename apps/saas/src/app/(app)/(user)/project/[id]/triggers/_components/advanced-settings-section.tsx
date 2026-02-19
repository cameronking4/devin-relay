"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConditionBuilder } from "./condition-builder";
import { ThresholdConfig } from "./threshold-config";
import { getRecentEventsForTrigger } from "@/server/actions/relay/queries";
import { inferPayloadPaths } from "@/lib/payload-paths";
import type {
    TriggerConditions,
    TriggerThresholdConfig,
} from "@/server/actions/relay/mutations";
import { PathPolicyConfig } from "./path-policy-config";

export type AdvancedSettingsValues = {
    conditions: TriggerConditions;
    thresholdConfig: TriggerThresholdConfig;
    concurrencyLimit: number;
    dailyCap: number;
    includePaths: string[];
    excludePaths: string[];
};

export function AdvancedSettingsSection({
    values,
    onChange,
    collapsible = false,
    triggerId,
    projectId,
    githubRepo,
}: {
    values: AdvancedSettingsValues;
    onChange: (values: AdvancedSettingsValues) => void;
    collapsible?: boolean;
    triggerId?: string;
    projectId?: string;
    /** owner/repo - when set, PathPolicyConfig shows Browse repository button */
    githubRepo?: string;
}) {
    const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);

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
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [triggerId, projectId]);

    const content = (
        <div className="space-y-6">
            {/* Conditions card */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Conditions</CardTitle>
                    <CardDescription>
                        Filter which webhook events trigger Devin. Events must match <em>all</em> conditions (AND logic). Leave empty to run on every event—useful when you want to narrow down (e.g. only errors, or only main branch).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ConditionBuilder
                        conditions={values.conditions}
                        onChange={(conditions) =>
                            onChange({ ...values, conditions })
                        }
                        suggestedPaths={suggestedPaths}
                        hideLabel
                    />
                </CardContent>
            </Card>

            {/* Path policy / Restrict file edits card */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Restrict File Edits</CardTitle>
                    <CardDescription>
                        Limit which files and folders Devin can modify. Use include paths as an allowlist (e.g. only <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">src/**</code>), or exclude paths to block sensitive areas (e.g. <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">node_modules/**</code>). Globs supported.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PathPolicyConfig
                        includePaths={values.includePaths}
                        excludePaths={values.excludePaths}
                        onChange={(includePaths, excludePaths) =>
                            onChange({ ...values, includePaths, excludePaths })
                        }
                        githubRepo={githubRepo}
                    />
                </CardContent>
            </Card>

            {/* Threshold card */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Event threshold</CardTitle>
                    <CardDescription>
                        Trigger Devin only after a certain number of matching events within a time window. Useful to batch noisy alerts—e.g. run once after 3 errors in 5 minutes instead of reacting to every single event.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ThresholdConfig
                        config={values.thresholdConfig}
                        onChange={(thresholdConfig) =>
                            onChange({ ...values, thresholdConfig })
                        }
                    />
                </CardContent>
            </Card>

            {/* Rate limits card */}
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Rate limits</CardTitle>
                    <CardDescription>
                        Guard against spikes and control costs. Concurrency limit caps how many Devin sessions run in parallel; daily cap limits total runs per day for this trigger.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="concurrencyLimit">Concurrency limit</Label>
                            <p className="text-muted-foreground text-xs">
                                Max Devin sessions running at once. Prevents overload when many events arrive simultaneously.
                            </p>
                            <Input
                                id="concurrencyLimit"
                                type="number"
                                min={1}
                                value={values.concurrencyLimit}
                                onChange={(e) =>
                                    onChange({
                                        ...values,
                                        concurrencyLimit: Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dailyCap">Daily cap</Label>
                            <p className="text-muted-foreground text-xs">
                                Max runs per day for this trigger. Helps control costs and prevent runaway usage.
                            </p>
                            <Input
                                id="dailyCap"
                                type="number"
                                min={1}
                                value={values.dailyCap}
                                onChange={(e) =>
                                    onChange({
                                        ...values,
                                        dailyCap: Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (collapsible) {
        return (
            <Card>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced" className="border-none">
                        <CardHeader className="pb-3">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="text-left">
                                    <CardTitle>Advanced Settings</CardTitle>
                                    <CardDescription>
                                        Optional: Add filters and limits to
                                        control when Devin runs.
                                    </CardDescription>
                                </div>
                            </AccordionTrigger>
                        </CardHeader>
                        <AccordionContent>
                            <CardContent className="pt-0">{content}</CardContent>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                    Optional: Add filters and limits to control when Devin runs.
                </CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
