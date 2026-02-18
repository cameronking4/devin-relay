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
    const [hideGuidance, setHideGuidance] = useState(true);

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
                        <Alert className="bg-muted flex items-center px-3 py-2">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="p-0 m-0 text-center">
                                    You can skip this step and configure the webhook later if needed.
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            <IntegrationGuide triggerId={triggerId} />
        </div>
    );
}
