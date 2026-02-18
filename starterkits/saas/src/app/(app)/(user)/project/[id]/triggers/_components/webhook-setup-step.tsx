"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { WebhookUrlCard } from "./webhook-url-card";
import { IntegrationGuide } from "./integration-guide";
import { WebhookStatusPoller } from "./webhook-status-poller";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function WebhookSetupStep({
    triggerId,
    projectId,
    onStatusChange,
}: {
    triggerId: string;
    projectId: string;
    onStatusChange?: (isActive: boolean) => void;
}) {
    const [hideGuidance, setHideGuidance] = useState(false);

    const handleStatusChange = (isActive: boolean) => {
        onStatusChange?.(isActive);
        setHideGuidance(isActive);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Setup</CardTitle>
                    <CardDescription>
                        Copy this webhook URL and add it to your external service
                        (Sentry, Vercel, etc.). We&apos;ll detect when events
                        start coming in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <WebhookUrlCard triggerId={triggerId} />
                    <WebhookStatusPoller
                        triggerId={triggerId}
                        projectId={projectId}
                        onStatusChange={handleStatusChange}
                    />
                    {!hideGuidance && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Once you see a green checkmark indicating
                                webhook is active, you can continue to the next
                                step. You can also skip this step and configure
                                the webhook later.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            <IntegrationGuide triggerId={triggerId} />
        </div>
    );
}
