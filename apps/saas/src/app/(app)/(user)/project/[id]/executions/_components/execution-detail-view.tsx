"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteUrls } from "@/config/urls";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { ExecutionSummary } from "./execution-summary";
import { JsonViewer } from "./json-viewer";
import { OutputViewer } from "./output-viewer";

type Execution = Awaited<
    ReturnType<
        typeof import("@/server/actions/relay/queries").getExecutionById
    >
>;

export function ExecutionDetailView({
    execution,
    projectId,
}: {
    execution: NonNullable<Execution>;
    projectId: string;
}) {
    function copyPayload() {
        const text = JSON.stringify(execution.rawPayload ?? {}, null, 2);
        void navigator.clipboard.writeText(text);
        toast.success("Payload copied");
    }

    function copyPrompt() {
        const text = execution.renderedPrompt ?? "";
        void navigator.clipboard.writeText(text);
        toast.success("Prompt copied");
    }

    return (
        <Tabs defaultValue="summary" className="w-full">
            <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="payload">Raw payload</TabsTrigger>
                <TabsTrigger value="prompt">Rendered prompt</TabsTrigger>
                <TabsTrigger value="output">Devin output</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
                <ExecutionSummary execution={execution} />
            </TabsContent>
            <TabsContent value="payload">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Raw payload</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyPayload}>
                            <CopyIcon className="h-4 w-4" />
                            Copy
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <JsonViewer data={execution.rawPayload} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="prompt">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Rendered prompt</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyPrompt}>
                            <CopyIcon className="h-4 w-4" />
                            Copy
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted overflow-auto rounded-md p-4 text-sm whitespace-pre-wrap">
                            {execution.renderedPrompt ?? "—"}
                        </pre>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="output">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Devin output</CardTitle>
                        {execution.aiSessionId && (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={siteUrls.devin.session(
                                        execution.aiSessionId,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in Devin
                                </a>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <OutputViewer content={execution.output} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="errors">
                <Card>
                    <CardHeader>
                        <CardTitle>Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {execution.error ? (
                            <pre className="bg-destructive/10 text-destructive overflow-auto rounded-md p-4 text-sm whitespace-pre-wrap">
                                {execution.error}
                            </pre>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No errors recorded.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
