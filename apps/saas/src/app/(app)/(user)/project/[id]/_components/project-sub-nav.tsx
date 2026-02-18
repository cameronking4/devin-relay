"use client";

import { siteUrls } from "@/config/urls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProjectSubNav({ projectId }: { projectId: string }) {
    const pathname = usePathname();
    const overview = siteUrls.relay.project(projectId);
    const triggers = siteUrls.relay.triggers(projectId);
    const executions = siteUrls.relay.executions(projectId);

    const links = [
        { href: overview, label: "Overview" },
        { href: triggers, label: "Triggers" },
        { href: executions, label: "Executions" },
    ];

    return (
        <nav className="flex gap-4 border-b border-border pb-2">
            {links.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "border-b-2 border-transparent px-1 pb-2 text-sm font-medium transition-colors",
                        pathname === href
                            ? "border-primary text-foreground"
                            : "text-muted-foreground hover:border-muted hover:text-foreground",
                    )}
                >
                    {label}
                </Link>
            ))}
        </nav>
    );
}
