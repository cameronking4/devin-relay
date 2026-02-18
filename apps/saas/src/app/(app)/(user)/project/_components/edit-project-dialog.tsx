"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateRelayProject } from "@/server/actions/relay/mutations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function EditProjectDialog({
    projectId,
    initialName,
    open,
    onOpenChange,
}: {
    projectId: string;
    initialName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [pending, setPending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || name.trim() === initialName) {
            onOpenChange(false);
            return;
        }
        setPending(true);
        try {
            await updateRelayProject(projectId, name.trim());
            toast.success("Project updated");
            onOpenChange(false);
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to update project",
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Project name</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Relay Project"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Saving…" : "Save"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
