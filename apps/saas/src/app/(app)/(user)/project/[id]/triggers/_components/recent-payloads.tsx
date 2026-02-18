"use client";

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
import { CopyButton } from "./copy-button";
import { getRecentEventsForTrigger } from "@/server/actions/relay/queries";
import { useEffect, useState } from "react";

export function RecentPayloads({
    triggerId,
    projectId,
}: {
    triggerId: string;
    projectId: string;
}) {
    const [payloads, setPayloads] = useState<
        Array<{ id: string; rawPayload: unknown; receivedAt: Date }>
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const events = await getRecentEventsForTrigger(
                    triggerId,
                    projectId,
                    3,
                );
                setPayloads(events);
            } catch (e) {
                console.error("Failed to load payloads", e);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, [triggerId, projectId]);

    if (loading) {
        return null;
    }

    if (payloads.length === 0) {
        return null;
    }

    return (
        <Card>
            <Accordion type="single" collapsible defaultValue="">
                <AccordionItem value="recent-payloads" className="border-none">
                    <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="text-left">
                                <CardTitle>Recent Payloads</CardTitle>
                                <CardDescription>
                                    View recent webhook payloads to understand
                                    available data for conditions and prompts.
                                    Click copy to use in your template.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="space-y-4 pt-0">
                            {payloads.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-muted rounded-md border"
                                >
                                    <div className="border-b px-3 py-2 flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">
                                            {new Date(
                                                event.receivedAt,
                                            ).toLocaleString()}
                                        </span>
                                        <CopyButton
                                            text={JSON.stringify(
                                                event.rawPayload,
                                                null,
                                                2,
                                            )}
                                            label="Copy payload"
                                        />
                                    </div>
                                    <pre className="max-h-[200px] overflow-auto p-3 text-xs">
                                        {JSON.stringify(
                                            event.rawPayload,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            ))}
                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
