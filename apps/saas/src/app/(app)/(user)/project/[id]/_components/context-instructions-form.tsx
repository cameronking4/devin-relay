"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateRelayProjectContextInstructions } from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function ContextInstructionsForm({
    projectId,
    initialInstructions,
}: {
    projectId: string;
    initialInstructions: string | null;
}) {
    const router = useRouter();
    const [instructions, setInstructions] = useState(
        initialInstructions ?? "",
    );
    useEffect(() => {
        setInstructions(initialInstructions ?? "");
    }, [initialInstructions]);
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPending(true);
        try {
            await updateRelayProjectContextInstructions(
                projectId,
                instructions.trim() || null,
            );
            toast.success("Context instructions saved");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to save",
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <Card className="flex h-full w-full flex-col">
            <CardHeader>
                <CardTitle>Context instructions</CardTitle>
                <CardDescription>
                    Optional system instructions included with every Devin run
                    (e.g. &quot;Always run tests before committing. Use
                    TypeScript.&quot;)
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                <CardContent className="flex-1">
                    <div className="grid gap-2">
                        <Label htmlFor="context-instructions">
                            Instructions
                        </Label>
                        <textarea
                            id="context-instructions"
                            className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="E.g. Always run tests before committing. Use TypeScript."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={pending}>
                        {pending ? "Saving…" : "Save"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
