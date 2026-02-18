"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getWebhookActivity } from "@/server/actions/relay/queries";

const POLL_INTERVAL_MS = 5000; // 5 seconds

export function WebhookStatusPoller({
    triggerId,
    projectId,
    onStatusChange,
}: {
    triggerId: string;
    projectId: string;
    onStatusChange?: (isActive: boolean) => void;
}) {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastReceivedAt, setLastReceivedAt] = useState<Date | null>(null);
    const [totalEvents, setTotalEvents] = useState(0);

    const checkStatus = useCallback(async () => {
        if (!triggerId) return;

        try {
            setError(null);
            const activity = await getWebhookActivity(triggerId, projectId);

            if (activity) {
                const receivedAt = activity.lastReceivedAt
                    ? new Date(activity.lastReceivedAt)
                    : null;
                const active =
                    receivedAt &&
                    Date.now() - receivedAt.getTime() < 24 * 60 * 60 * 1000; // Active if received in last 24 hours

                setIsActive(active);
                setLastReceivedAt(receivedAt);
                setTotalEvents(activity.totalEvents);
                onStatusChange?.(active);
            }
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Unable to check status",
            );
        }
    }, [triggerId, projectId, onStatusChange]);

    useEffect(() => {
        if (!triggerId || isActive) return;

        // Initial check
        void checkStatus();

        // Poll until events are received, then stop
        const interval = setInterval(() => void checkStatus(), POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [triggerId, checkStatus, isActive]);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Badge
                    variant={isActive ? "outline" : "secondary"}
                    className="flex min-w-0 items-center gap-1.5 px-3 py-1.5"
                >
                    {isActive ? (
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                    ) : (
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    )}
                    <span className="truncate">
                        {isActive ? "Active" : "Checking..."}
                    </span>
                </Badge>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void checkStatus()}
                >
                    Test connection
                </Button>
            </div>
            {error && (
                <p className="text-destructive text-sm">{error}</p>
            )}
            {!error && (
                <div className="text-muted-foreground text-sm">
                    {isActive && totalEvents > 0 ? (
                        <>
                            {totalEvents} event{totalEvents !== 1 ? "s" : ""}{" "}
                            received
                            {lastReceivedAt && (
                                <> • Last: {lastReceivedAt.toLocaleString()}</>
                            )}
                        </>
                    ) : (
                        "Configure the webhook in your server to respond to events."
                    )}
                </div>
            )}
        </div>
    );
}
