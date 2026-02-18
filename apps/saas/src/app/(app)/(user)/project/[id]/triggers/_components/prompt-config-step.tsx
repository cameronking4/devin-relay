"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PromptEditor } from "./prompt-editor";
import Mustache from "mustache";

const EXAMPLE_PAYLOAD = {
    message: "Deploy failed on production",
    error_count: 3,
    action: "deploy_failed",
    repository: {
        name: "my-app",
        branch: "main",
    },
};

export function PromptConfigStep({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    let preview = "";
    try {
        const view = { payload: EXAMPLE_PAYLOAD };
        preview = Mustache.render(value, view).replace(/\0/g, "");
    } catch (e) {
        preview = `Error: ${e instanceof Error ? e.message : "Invalid template"}`;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Prompt Configuration</CardTitle>
                    <CardDescription>
                        Write the prompt that tells Devin what to do. Use{" "}
                        <code className="bg-muted rounded px-1">
                            {"{{payload.field}}"}
                        </code>{" "}
                        to include webhook data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PromptEditor value={value} onChange={onChange} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        How your prompt will look with example webhook data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted rounded-md p-4">
                        <pre className="whitespace-pre-wrap text-sm">
                            {preview || "Enter a prompt template to see preview"}
                        </pre>
                    </div>
                    <div className="mt-4">
                        <p className="text-muted-foreground mb-2 text-xs font-medium">
                            Example payload used:
                        </p>
                        <pre className="bg-muted max-h-[200px] overflow-auto rounded-md p-3 text-xs">
                            {JSON.stringify(EXAMPLE_PAYLOAD, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
