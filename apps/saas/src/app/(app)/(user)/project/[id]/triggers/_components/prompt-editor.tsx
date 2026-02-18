"use client";

import { Label } from "@/components/ui/label";

const COMMON_PATHS = [
    "payload.message",
    "payload.error_count",
    "payload.action",
    "payload.repository.name",
];

export function PromptEditor({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="prompt-template">Prompt template (Mustache)</Label>
                <span className="text-muted-foreground text-xs">
                    {value.length} chars
                </span>
            </div>
            <textarea
                id="prompt-template"
                className="border-input focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={
                    placeholder ??
                    "Review and fix the error: {{payload.message}}"
                }
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
                <span className="text-muted-foreground text-xs">
                    Insert variable:
                </span>
                {COMMON_PATHS.map((path) => (
                    <button
                        key={path}
                        type="button"
                        className="text-muted-foreground hover:text-foreground rounded bg-muted px-2 py-0.5 text-xs"
                        onClick={() =>
                            onChange(value + ` {{${path}}}`)
                        }
                    >
                        {path}
                    </button>
                ))}
            </div>
        </div>
    );
}
