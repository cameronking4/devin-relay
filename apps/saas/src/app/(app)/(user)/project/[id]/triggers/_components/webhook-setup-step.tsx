"use client";

import { useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WebhookUrlCard } from "./webhook-url-card";
import { IntegrationGuide } from "./integration-guide";
import {
    WebhookStatusPoller,
    type WebhookStatusPollerRef,
} from "./webhook-status-poller";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SAMPLE_PAYLOAD = {
    message: "Test event from setup",
    timestamp: new Date().toISOString(),
    source: "wizard",
};

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
    const [sendingTest, setSendingTest] = useState(false);

    const handleStatusChange = (isActive: boolean) => {
        onStatusChange?.(isActive);
        setHideGuidance(isActive);
    };

    const origin =
        typeof window !== "undefined" ? window.location.origin : "";
    const webhookUrl = origin
        ? `${origin}/api/webhook/custom/${triggerId}`
        : "";

    async function sendTestPayload() {
        if (!webhookUrl) return;
        setSendingTest(true);
        try {
            const res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(SAMPLE_PAYLOAD),
            });
            if (!res.ok) {
                const text = await res.text();
                toast.error(`Request failed: ${res.status} ${text}`);
                return;
            }
            toast.success(
                "Test sent. Payload is stored and will be available for variable autofill in the next steps.",
            );
            pollerRef.current?.checkStatus();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Request failed");
        } finally {
            setSendingTest(false);
        }
    }

    const pollerRef = useRef<WebhookStatusPollerRef>(null);

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
                        ref={pollerRef}
                        triggerId={triggerId}
                        projectId={projectId}
                        onStatusChange={handleStatusChange}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void sendTestPayload()}
                            disabled={sendingTest || !webhookUrl}
                        >
                            {sendingTest ? "Sending…" : "Send test payload"}
                        </Button>
                        <span className="text-muted-foreground text-xs">
                            Stores the payload for variable autofill in prompt
                            and conditions. Devin will not run until you finish
                            setup.
                        </span>
                    </div>
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
