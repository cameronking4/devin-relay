"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { createRelayWorkflow, updateRelayWorkflow } from "@/server/actions/relay/mutations";
import { siteUrls } from "@/config/urls";
import { toast } from "sonner";
import { GithubRepoInput } from "./github-repo-input";

type TriggerOption = { id: string; name: string; source: string };

export function WorkflowForm({
    projectId,
    workflowId,
    initialName,
    initialTriggerIds,
    initialMatchMode,
    initialTimeWindowMinutes,
    initialPromptTemplate,
    initialGithubRepo,
    triggers,
}: {
    projectId: string;
    workflowId?: string;
    initialName: string;
    initialTriggerIds: string[];
    initialMatchMode: "any" | "all";
    initialTimeWindowMinutes: number;
    initialPromptTemplate: string;
    initialGithubRepo: string;
    triggers: TriggerOption[];
}) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [triggerIds, setTriggerIds] = useState<string[]>(initialTriggerIds);
    const [matchMode, setMatchMode] = useState<"any" | "all">(initialMatchMode);
    const [timeWindowMinutes, setTimeWindowMinutes] = useState(
        initialTimeWindowMinutes,
    );
    const [promptTemplate, setPromptTemplate] = useState(
        initialPromptTemplate,
    );
    const [githubRepo, setGithubRepo] = useState(initialGithubRepo);
    const [pending, setPending] = useState(false);

    function toggleTrigger(id: string) {
        setTriggerIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (triggerIds.length === 0) {
            toast.error("Select at least one trigger");
            return;
        }
        if (!promptTemplate.trim()) {
            toast.error("Prompt template is required");
            return;
        }
        setPending(true);
        try {
            if (workflowId) {
                await updateRelayWorkflow(projectId, workflowId, {
                    name: name.trim(),
                    triggerIds,
                    matchMode,
                    timeWindowMinutes,
                    promptTemplate,
                    githubRepo: githubRepo.trim(),
                });
                toast.success("Workflow updated");
                router.push(siteUrls.relay.workflow(projectId, workflowId));
            } else {
                const w = await createRelayWorkflow(projectId, {
                    name: name.trim(),
                    triggerIds,
                    matchMode,
                    timeWindowMinutes,
                    promptTemplate,
                    githubRepo: githubRepo.trim(),
                });
                toast.success("Workflow created");
                router.push(siteUrls.relay.workflow(projectId, w.id));
            }
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to save workflow",
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Workflow</CardTitle>
                    <CardDescription>
                        Combine events from multiple triggers. Devin runs when
                        the match condition is met within the time window.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sentry + Vercel deployment failure"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Triggers (sources) *</Label>
                        <p className="text-muted-foreground text-xs">
                            Select triggers whose events can fire this workflow.
                        </p>
                        <div className="flex flex-wrap gap-4 rounded-md border border-border p-3">
                            {triggers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No triggers in this project. Create triggers
                                    first, then add a workflow.
                                </p>
                            ) : (
                                triggers.map((t) => (
                                    <label
                                        key={t.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={triggerIds.includes(t.id)}
                                            onCheckedChange={() =>
                                                toggleTrigger(t.id)
                                            }
                                        />
                                        <span className="text-sm">
                                            {t.name}
                                            {t.source && (
                                                <span className="text-muted-foreground ml-1">
                                                    ({t.source})
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Match when</Label>
                        <RadioGroup
                            value={matchMode}
                            onValueChange={(v) =>
                                setMatchMode(v as "any" | "all")
                            }
                            className="flex gap-4"
                        >
                            <label className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem value="any" />
                                <span className="text-sm">
                                    Any — at least one trigger has an event in
                                    the window
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem value="all" />
                                <span className="text-sm">
                                    All — every selected trigger has at least
                                    one event in the window
                                </span>
                            </label>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="window">Time window (minutes)</Label>
                        <Input
                            id="window"
                            type="number"
                            min={1}
                            value={timeWindowMinutes}
                            onChange={(e) =>
                                setTimeWindowMinutes(
                                    Math.max(
                                        1,
                                        parseInt(e.target.value, 10) || 1,
                                    ),
                                )
                            }
                        />
                        <p className="text-muted-foreground text-xs">
                            Look back this many minutes when evaluating the
                            match.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prompt & repository</CardTitle>
                    <CardDescription>
                        The prompt sent to Devin. Use {"{{payload}}"} for event
                        data; with multiple sources you get {"{{payload.sources}}"} and {"{{payload.summary}}"}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Prompt template *</Label>
                        <Textarea
                            id="prompt"
                            value={promptTemplate}
                            onChange={(e) => setPromptTemplate(e.target.value)}
                            placeholder="Review these events and suggest a fix: {{payload.summary}}"
                            rows={5}
                            className="font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="repo">GitHub repository</Label>
                        <GithubRepoInput
                            value={githubRepo}
                            onChange={setGithubRepo}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={pending}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving..." : workflowId ? "Update workflow" : "Create workflow"}
                </Button>
            </div>
        </form>
    );
}
