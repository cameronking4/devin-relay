"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRelayProject } from "@/server/actions/relay/mutations";
import { siteUrls } from "@/config/urls";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export function CreateProjectDialog({
    triggerLabel = "New project",
}: {
    triggerLabel?: string;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setPending(true);
        try {
            const project = await createRelayProject(name.trim());
            toast.success("Project created");
            setOpen(false);
            setName("");
            router.push(siteUrls.relay.project(project.id));
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to create project",
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New project</DialogTitle>
                    <DialogDescription>
                        Projects group webhooks and triggers together. Use them to
                        organize by team, environment, or integration—e.g. &quot;Prod
                        Alerts&quot; or &quot;Staging Webhooks&quot;.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Prod Alerts, Staging Webhooks"
                            required
                        />
                        <p className="text-muted-foreground text-xs">
                            Choose a name that helps you find triggers quickly.
                        </p>
                    </div>
                    <Button type="submit" disabled={pending}>
                        {pending ? "Creating…" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
