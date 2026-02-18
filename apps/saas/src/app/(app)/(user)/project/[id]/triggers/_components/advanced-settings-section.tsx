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
            <div>
                <Label className="mb-2 block">Conditions</Label>
                <p className="text-muted-foreground mb-4 text-sm">
                    All conditions must pass (AND). Leave empty to match all
                    events.
                </p>
                <ConditionBuilder
                    conditions={values.conditions}
                    onChange={(conditions) =>
                        onChange({ ...values, conditions })
                    }
                    suggestedPaths={suggestedPaths}
                />
            </div>

            <div>
                <Label className="mb-2 block">Path policy</Label>
                <p className="text-muted-foreground mb-4 text-sm">
                    Restrict which paths Devin can work in. Passed to Devin as
                    context for policy control.
                </p>
                <PathPolicyConfig
                    includePaths={values.includePaths}
                    excludePaths={values.excludePaths}
                    onChange={(includePaths, excludePaths) =>
                        onChange({ ...values, includePaths, excludePaths })
                    }
                    githubRepo={githubRepo}
                />
            </div>

            <div>
                <Label className="mb-2 block">Threshold</Label>
                <p className="text-muted-foreground mb-4 text-sm">
                    Optionally trigger only when N events occur in a time
                    window.
                </p>
                <ThresholdConfig
                    config={values.thresholdConfig}
                    onChange={(thresholdConfig) =>
                        onChange({ ...values, thresholdConfig })
                    }
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="concurrencyLimit">Concurrency limit</Label>
                    <p className="text-muted-foreground text-xs">
                        Max Devin sessions that can run in parallel for this
                        trigger. Prevents overload when many events arrive at
                        once.
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
                        Max times Devin can run per day for this trigger. Helps
                        control costs and prevent runaway usage.
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
