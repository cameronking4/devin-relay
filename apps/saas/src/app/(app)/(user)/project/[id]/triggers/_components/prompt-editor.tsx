"use client";

import { Label } from "@/components/ui/label";

export function PromptEditor({
    value,
    onChange,
    placeholder,
    suggestedPaths = [],
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Inferred paths from test connection; only show variable picker when present */
    suggestedPaths?: string[];
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
            {suggestedPaths.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                        From recent events:
                    </span>
                    {suggestedPaths.map((path) => (
                        <button
                            key={path}
                            type="button"
                            className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs transition-colors hover:bg-muted/80"
                            onClick={() =>
                                onChange(value + ` {{${path}}}`)
                            }
                        >
                            {path}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
