"use client";

export function JsonViewer({ data }: { data: unknown }) {
    const text =
        data == null
            ? "null"
            : typeof data === "object"
              ? JSON.stringify(data, null, 2)
              : String(data);

    return (
        <pre className="bg-muted overflow-auto max-h-[60vh] rounded-md p-4 text-sm">
            {text}
        </pre>
    );
}
