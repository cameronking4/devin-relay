"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
                    <PlusIcon className="h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Relay Project"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={pending}>
                        {pending ? "Creating…" : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
