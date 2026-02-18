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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    updateRelayProjectDevinKey,
    validateStoredDevinKey,
} from "@/server/actions/relay/mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectKeyForm({
    projectId,
    hasDevinKey,
}: {
    projectId: string;
    hasDevinKey: boolean;
}) {
    const router = useRouter();
    const [key, setKey] = useState("");
    const [savePending, setSavePending] = useState(false);
    const [validatePending, setValidatePending] = useState(false);

    async function handleSave() {
        const value = key.trim();
        if (!value) {
            toast.error("Enter an API key to save");
            return;
        }
        setSavePending(true);
        try {
            await updateRelayProjectDevinKey(projectId, value);
            toast.success("API key saved");
            setKey("");
            router.refresh();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to save API key",
            );
        } finally {
            setSavePending(false);
        }
    }

    async function handleValidate() {
        const value = key.trim();
        if (value) {
            setValidatePending(true);
            try {
                const res = await fetch("/api/devin/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ apiKey: value }),
                });
                const data = (await res.json()) as { valid?: boolean };
                if (data.valid) toast.success("API key is valid");
                else toast.error("API key is invalid");
            } catch {
                toast.error("Validation request failed");
            } finally {
                setValidatePending(false);
            }
        } else if (hasDevinKey) {
            setValidatePending(true);
            try {
                const { valid } = await validateStoredDevinKey(projectId);
                if (valid) toast.success("Stored API key is valid");
                else toast.error("Stored API key is invalid or expired");
            } catch {
                toast.error("Validation failed");
            } finally {
                setValidatePending(false);
            }
        } else {
            toast.error("Enter an API key to validate, or save one first");
        }
    }

    return (
        <Card className="flex h-full w-full flex-col">
            <CardHeader>
                <CardTitle>Devin API Key</CardTitle>
                <CardDescription>
                    Store your Devin API key to run sessions. It is encrypted
                    at rest. {hasDevinKey && "A key is already set; enter a new one to replace."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="devin-key">API key</Label>
                    <Input
                        id="devin-key"
                        type="password"
                        autoComplete="off"
                        placeholder={hasDevinKey ? "••••••••••••" : "Enter your Devin API key"}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button
                    type="button"
                    variant="default"
                    onClick={handleSave}
                    disabled={savePending || !key.trim()}
                >
                    {savePending ? "Saving…" : "Save"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleValidate}
                    disabled={validatePending}
                >
                    {validatePending ? "Checking…" : "Validate"}
                </Button>
            </CardFooter>
        </Card>
    );
}
