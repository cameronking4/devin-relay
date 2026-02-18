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
import { Code2, ExternalLink } from "lucide-react";

const INTEGRATIONS = [
    {
        name: "Sentry",
        description: "Send Sentry error alerts to trigger Devin",
        setup: [
            "Go to your Sentry project settings",
            "Navigate to Alerts → Alert Rules",
            "Create a new alert rule",
            "Set the action to 'Send a webhook'",
            "Use the webhook URL below",
            "Configure the payload format (see example)",
        ],
        examplePayload: {
            event: {
                id: "abc123",
                message: "Error: Cannot read property 'x' of undefined",
                level: "error",
                timestamp: "2024-01-15T10:30:00Z",
            },
            project: {
                name: "my-app",
                slug: "my-app",
            },
            url: "https://sentry.io/organizations/org/issues/123/",
        },
    },
    {
        name: "Vercel",
        description: "Trigger Devin on Vercel deployment events",
        setup: [
            "Go to your Vercel project settings",
            "Navigate to Integrations → Webhooks",
            "Click 'Create Webhook'",
            "Select events: 'Deployment Created', 'Deployment Failed'",
            "Use the webhook URL below",
            "Save the webhook",
        ],
        examplePayload: {
            id: "deployment_123",
            type: "deployment",
            payload: {
                deployment: {
                    id: "dpl_abc123",
                    url: "https://my-app.vercel.app",
                    state: "ERROR",
                    error: "Build failed: npm install error",
                },
                project: {
                    name: "my-app",
                },
            },
        },
    },
    {
        name: "GitHub",
        description: "Trigger Devin on GitHub webhook events",
        setup: [
            "Go to your GitHub repository settings",
            "Navigate to Webhooks → Add webhook",
            "Set the Payload URL to the webhook URL below",
            "Select content type: application/json",
            "Choose events: Issues, Pull requests, Pushes",
            "Save the webhook",
        ],
        examplePayload: {
            action: "opened",
            issue: {
                number: 42,
                title: "Bug: Login page not loading",
                body: "Users report the login page hangs",
                state: "open",
            },
            repository: {
                name: "my-app",
                full_name: "org/my-app",
            },
        },
    },
    {
        name: "Custom Service",
        description: "Send webhooks from any service",
        setup: [
            "Configure your service to send POST requests",
            "Set Content-Type header to application/json",
            "Use the webhook URL below as the endpoint",
            "Send JSON payloads matching your event structure",
        ],
        examplePayload: {
            message: "Deploy failed on production",
            error_count: 3,
            action: "deploy_failed",
            repository: {
                name: "my-app",
                branch: "main",
            },
        },
    },
] as const;

export function IntegrationGuide({ triggerId }: { triggerId?: string }) {
    const origin =
        typeof window !== "undefined" ? window.location.origin : "";
    const webhookUrl = triggerId
        ? `${origin}/api/webhook/custom/${triggerId}`
        : "https://your-domain.com/api/webhook/custom/{triggerId}";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Integration Guide
                </CardTitle>
                <CardDescription>
                    Configure external services to send webhooks to your trigger.
                    Copy the webhook URL and follow the setup instructions below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* <div className="bg-muted rounded-md p-3">
                    <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Webhook URL
                    </p>
                    <code className="text-foreground break-all text-sm">
                        {webhookUrl || "Create trigger to get URL"}
                    </code>
                </div> */}

                <Accordion type="single" collapsible className="w-full">
                    {INTEGRATIONS.map((integration) => (
                        <AccordionItem
                            key={integration.name}
                            value={integration.name}
                        >
                            <AccordionTrigger className="text-left">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {integration.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm font-normal">
                                        {integration.description}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">
                                        Setup Steps
                                    </h4>
                                    <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
                                        {integration.setup.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">
                                        Example Payload
                                    </h4>
                                    <pre className="bg-muted max-h-[300px] overflow-auto rounded-md p-3 text-xs">
                                        {JSON.stringify(
                                            integration.examplePayload,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                        Use dot notation in conditions and templates, e.g.{" "}
                                        <code>
                                            payload.event.message
                                        </code>
                                        ,{" "}
                                        <code>
                                            payload.repository.name
                                        </code>
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
