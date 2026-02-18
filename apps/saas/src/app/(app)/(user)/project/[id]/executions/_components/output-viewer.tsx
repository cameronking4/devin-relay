"use client";

export function OutputViewer({ content }: { content: string | null }) {
    if (!content?.trim()) {
        return (
            <p className="text-muted-foreground text-sm">No output recorded.</p>
        );
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="bg-muted overflow-auto max-h-[60vh] whitespace-pre-wrap rounded-md p-4 text-sm">
                {content}
            </pre>
        </div>
    );
}
