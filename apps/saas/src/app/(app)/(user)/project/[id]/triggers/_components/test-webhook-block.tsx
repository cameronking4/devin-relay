"use client";

import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { siteUrls } from "@/config/urls";
import { useState } from "react";
import { toast } from "sonner";

const SAMPLE_PAYLOAD = `{
  "message": "Deploy failed on production",
  "error_count": 3,
  "action": "deploy_failed",
  "repository": { "name": "my-app", "branch": "main" }
}`;

export function TestWebhookBlock({
    triggerId,
    projectId,
}: {
    triggerId: string;
    projectId: string;
}) {
    const [payload, setPayload] = useState(SAMPLE_PAYLOAD);
    const [pending, setPending] = useState(false);

    const origin =
        typeof window !== "undefined" ? window.location.origin : "";
    const url = origin ? `${origin}/api/webhook/custom/${triggerId}` : "";

    async function sendTest() {
        let body: unknown;
        try {
            body = JSON.parse(payload);
        } catch {
            toast.error("Invalid JSON");
            return;
        }
        setPending(true);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text();
                toast.error(`Request failed: ${res.status} ${text}`);
                return;
            }
            toast.success("Test request sent. Open Executions to see the payload and run.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Request failed");
        } finally {
            setPending(false);
        }
    }

    return (
        <Card>
            <Accordion type="single" collapsible defaultValue="">
                <AccordionItem value="test-webhook" className="border-none">
                    <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="text-left">
                                <CardTitle>Test webhook</CardTitle>
                                <CardDescription>
                    Send a test payload to see how it’s received. Then open
                    Executions to view the raw payload and infer variables for
                    conditions and the prompt template.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="space-y-4 pt-0">
                            <div>
                                <label className="text-muted-foreground mb-1 block text-sm">
                                    JSON body
                                </label>
                                <textarea
                                    className="border-input focus-visible:ring-ring min-h-[140px] w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-1"
                                    value={payload}
                                    onChange={(e) => setPayload(e.target.value)}
                                    placeholder='{"message": "hello"}'
                                    spellCheck={false}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="default"
                                    onClick={sendTest}
                                    disabled={pending || !url}
                                >
                                    {pending ? "Sending…" : "Send test request"}
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={siteUrls.relay.executions(projectId)}>
                                        View executions
                                    </Link>
                                </Button>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Use dot notation in conditions and templates,
                                e.g. <code>payload.message</code>,{" "}
                                <code>payload.repository.name</code>.
                            </p>
                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
