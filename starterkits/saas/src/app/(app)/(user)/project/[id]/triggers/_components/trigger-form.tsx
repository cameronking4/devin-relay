"use client";

import { useState } from "react";
import Link from "next/link";
import { siteUrls } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type {
    TriggerConditions,
    TriggerThresholdConfig,
} from "@/server/actions/relay/mutations";
import { AdvancedSettingsSection } from "./advanced-settings-section";
import { PromptEditor } from "./prompt-editor";
import { WebhookActivity } from "./webhook-activity";

export type TriggerFormValues = {
    name: string;
    source: string;
    eventType: string;
    promptTemplate: string;
    conditions: TriggerConditions;
    thresholdConfig: TriggerThresholdConfig;
    concurrencyLimit: number;
    dailyCap: number;
};

const DEFAULT_VALUES: TriggerFormValues = {
    name: "",
    source: "Custom",
    eventType: "",
    promptTemplate: "My application recieved this signal, please review and fix: {{payload.message}}",
    conditions: [],
    thresholdConfig: null,
    concurrencyLimit: 3,
    dailyCap: 50,
};

export function TriggerForm({
    projectId,
    triggerId,
    initialValues,
    onSubmit,
    pending,
    submitLabel = "Save",
}: {
    projectId: string;
    triggerId?: string;
    initialValues?: Partial<TriggerFormValues>;
    onSubmit: (values: TriggerFormValues) => Promise<void>;
    pending: boolean;
    submitLabel?: string;
}) {
    const [name, setName] = useState(initialValues?.name ?? DEFAULT_VALUES.name);
    const [source, setSource] = useState(
        initialValues?.source ?? DEFAULT_VALUES.source,
    );
    const [eventType, setEventType] = useState(
        initialValues?.eventType ?? DEFAULT_VALUES.eventType,
    );
    const [promptTemplate, setPromptTemplate] = useState(
        initialValues?.promptTemplate ?? DEFAULT_VALUES.promptTemplate,
    );
    const [conditions, setConditions] = useState<TriggerConditions>(
        initialValues?.conditions ?? DEFAULT_VALUES.conditions,
    );
    const [thresholdConfig, setThresholdConfig] =
        useState<TriggerThresholdConfig>(
            initialValues?.thresholdConfig ?? DEFAULT_VALUES.thresholdConfig,
        );
    const [concurrencyLimit, setConcurrencyLimit] = useState(
        initialValues?.concurrencyLimit ?? DEFAULT_VALUES.concurrencyLimit,
    );
    const [dailyCap, setDailyCap] = useState(
        initialValues?.dailyCap ?? DEFAULT_VALUES.dailyCap,
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await onSubmit({
            name,
            source,
            eventType,
            promptTemplate,
            conditions,
            thresholdConfig,
            concurrencyLimit,
            dailyCap,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        Name, source, and event type for this trigger.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name (required)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Deploy failed handler"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="source">Source</Label>
                        <Input
                            id="source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="e.g. Sentry, Vercel, GitHub, Custom"
                        />
                        <p className="text-muted-foreground text-xs">
                            Label for organization (e.g., which service sends webhooks to this trigger)
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="eventType">Event type</Label>
                        <Input
                            id="eventType"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            placeholder="e.g. deploy_failed, error_alert (optional label)"
                        />
                        <p className="text-muted-foreground text-xs">
                            Optional label for organization. Actual event filtering is done via conditions below.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {triggerId && (
                <WebhookActivity
                    triggerId={triggerId}
                    projectId={projectId}
                />
            )}

            <AdvancedSettingsSection
                values={{
                    conditions,
                    thresholdConfig,
                    concurrencyLimit,
                    dailyCap,
                }}
                onChange={(values) => {
                    setConditions(values.conditions);
                    setThresholdConfig(values.thresholdConfig);
                    setConcurrencyLimit(values.concurrencyLimit);
                    setDailyCap(values.dailyCap);
                }}
                collapsible={true}
                triggerId={triggerId}
                projectId={projectId}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Prompt</CardTitle>
                    <CardDescription>
                        Mustache template. Use {"{{payload.field}}"} for event
                        data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PromptEditor
                        value={promptTemplate}
                        onChange={setPromptTemplate}
                    />
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : submitLabel}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href={siteUrls.relay.triggers(projectId)}>
                        Cancel
                    </Link>
                </Button>
            </div>
        </form>
    );
}
