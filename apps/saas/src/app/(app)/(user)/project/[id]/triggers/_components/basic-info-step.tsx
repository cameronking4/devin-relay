"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export type BasicInfoValues = {
    name: string;
    source: string;
    eventType: string;
};

export function BasicInfoStep({
    values,
    onChange,
}: {
    values: BasicInfoValues;
    onChange: (values: BasicInfoValues) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                    What is this trigger for? Give it a descriptive name and
                    label the source service.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={values.name}
                        onChange={(e) =>
                            onChange({ ...values, name: e.target.value })
                        }
                        placeholder="Deploy failed handler"
                        required
                    />
                    <p className="text-muted-foreground text-xs">
                        This trigger will invoke Devin AI when webhook events
                        match your conditions.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                        id="source"
                        value={values.source}
                        onChange={(e) =>
                            onChange({ ...values, source: e.target.value })
                        }
                        placeholder="e.g. Sentry, Vercel, GitHub, Custom"
                    />
                    <p className="text-muted-foreground text-xs">
                        Label for organization (e.g., which service sends
                        webhooks to this trigger)
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventType">Event type</Label>
                    <Input
                        id="eventType"
                        value={values.eventType}
                        onChange={(e) =>
                            onChange({ ...values, eventType: e.target.value })
                        }
                        placeholder="e.g. deploy_failed, error_alert (optional)"
                    />
                    <p className="text-muted-foreground text-xs">
                        Optional label for organization. Actual event filtering
                        is done via conditions in advanced settings.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
