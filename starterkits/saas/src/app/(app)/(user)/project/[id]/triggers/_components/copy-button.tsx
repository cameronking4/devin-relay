"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({
    text,
    label = "Copy",
}: {
    text: string;
    label?: string;
}) {
    function copy() {
        void navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    }

    return (
        <Button variant="ghost" size="sm" onClick={copy}>
            <CopyIcon className="h-3 w-3" />
        </Button>
    );
}
