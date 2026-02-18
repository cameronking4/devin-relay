"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export function WebhookUrlCard({ triggerId }: { triggerId: string }) {
    const origin =
        typeof window !== "undefined" ? window.location.origin : "";
    const url = origin ? `${origin}/api/webhook/custom/${triggerId}` : "";

    function copy() {
        void navigator.clipboard.writeText(url);
        toast.success("Webhook URL copied");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Webhook URL</CardTitle>
                <CardDescription>
                    POST JSON to this URL from your app, GitHub, or any
                    service. Use it in your external system to fire this
                    trigger.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
                <code className="bg-muted flex-1 rounded px-2 py-1.5 text-sm break-all">
                    {url || "Loading…"}
                </code>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copy}
                    disabled={!url}
                >
                    <CopyIcon className="h-4 w-4" />
                    Copy
                </Button>
            </CardContent>
        </Card>
    );
}
