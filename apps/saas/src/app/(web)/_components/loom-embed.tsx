"use client";

import { oembed } from "@loomhq/loom-embed";
import { useEffect, useRef, useState } from "react";

const DEFAULT_LOOM_URL =
    "https://www.loom.com/share/6b739e1be3854467bf3341e089664891";

export function LoomEmbed({
    shareUrl = DEFAULT_LOOM_URL,
}: {
    shareUrl?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [embedHtml, setEmbedHtml] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        oembed(shareUrl, {
                width: 1920,
                height: 1080,
            })
            .then(({ html }) => {
                if (!cancelled && containerRef.current) {
                    setEmbedHtml(html);
                }
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });
        return () => {
            cancelled = true;
        };
    }, [shareUrl]);

    if (error) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
                Video unavailable
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
            suppressHydrationWarning
        >
            {embedHtml != null ? (
                <div
                    className="h-full w-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
                    dangerouslySetInnerHTML={{ __html: embedHtml }}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted-foreground/20" />
                </div>
            )}
        </div>
    );
}
