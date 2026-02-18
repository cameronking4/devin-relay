"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGitHubRepoTree, type GitHubTreeEntry } from "@/server/actions/github";
import { Icons } from "@/components/ui/icons";
import { Folder, FolderOpen, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type TreeNode = {
    name: string;
    fullPath: string;
    type: "blob" | "tree";
    children: TreeNode[];
};

function buildTree(entries: GitHubTreeEntry[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();

    for (const entry of entries) {
        const parts = entry.path.split("/");
        let currentPath = "";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]!;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isLast = i === parts.length - 1;

            if (!nodeMap.has(currentPath)) {
                const node: TreeNode = {
                    name: part,
                    fullPath: currentPath,
                    type: isLast ? entry.type : "tree",
                    children: [],
                };
                nodeMap.set(currentPath, node);
                if (i > 0) {
                    const parentPath = parts.slice(0, i).join("/");
                    const parent = nodeMap.get(parentPath);
                    if (parent) parent.children.push(node);
                }
            }
        }
    }

    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
        nodes.forEach((n) => sortNodes(n.children));
    };
    const roots = Array.from(nodeMap.values()).filter(
        (n) => !n.fullPath.includes("/"),
    );
    sortNodes(roots);
    return roots;
}

export function RepoTreePickerDialog({
    open,
    onOpenChange,
    owner,
    repo,
    onAddToInclude,
    onAddToExclude,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    owner: string;
    repo: string;
    onAddToInclude: (paths: string[]) => void;
    onAddToExclude: (paths: string[]) => void;
}) {
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!open || !owner.trim() || !repo.trim()) return;
        setLoading(true);
        setError(null);
        setSelected(new Set());
        getGitHubRepoTree(owner.trim(), repo.trim())
            .then((result) => {
                if ("error" in result) {
                    setError(result.error);
                    setTree([]);
                } else {
                    const nodes = buildTree(result.tree);
                    setTree(nodes);
                    setError(null);
                    // Expand root-level folders by default
                    setExpanded(
                        new Set(
                            nodes
                                .filter((n) => n.type === "tree")
                                .map((n) => n.fullPath),
                        ),
                    );
                }
            })
            .catch((e) => {
                setError(e instanceof Error ? e.message : "Failed to load");
                setTree([]);
            })
            .finally(() => setLoading(false));
    }, [open, owner, repo]);

    const toggleSelect = (path: string, type: "blob" | "tree") => {
        const pathToAdd = type === "tree" ? `${path}/**` : path;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(pathToAdd)) next.delete(pathToAdd);
            else next.add(pathToAdd);
            return next;
        });
    };

    const handleAddTo = (target: "include" | "exclude") => {
        const paths = Array.from(selected);
        if (paths.length === 0) {
            toast.error("Select at least one path");
            return;
        }
        if (target === "include") onAddToInclude(paths);
        else onAddToExclude(paths);
        setSelected(new Set());
        onOpenChange(false);
        toast.success(`Added ${paths.length} path(s) to ${target}`);
    };

    const toggleExpand = (path: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    function renderNode(node: TreeNode, depth: number) {
        const pathToUse =
            node.type === "tree" ? `${node.fullPath}/**` : node.fullPath;
        const checked = selected.has(pathToUse);
        const isFolder = node.type === "tree";
        const isExpanded = expanded.has(node.fullPath);

        return (
            <div key={node.fullPath} className="flex flex-col">
                <div
                    className="flex items-center gap-2 py-1 pr-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    style={{ paddingLeft: depth * 16 }}
                    onClick={() => toggleSelect(node.fullPath, node.type)}
                >
                    {isFolder ? (
                        <button
                            type="button"
                            className="p-0.5 -ml-0.5 rounded hover:bg-muted"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.fullPath);
                            }}
                        >
                            <ChevronRight
                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                        </button>
                    ) : (
                        <span className="w-5" />
                    )}
                    <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                            toggleSelect(node.fullPath, node.type)
                        }
                        onClick={(e) => e.stopPropagation()}
                    />
                    {isFolder ? (
                        isExpanded ? (
                            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                        )
                    ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="font-mono text-sm truncate">
                        {node.name}
                    </span>
                </div>
                {isFolder && isExpanded &&
                    node.children.map((child) =>
                        renderNode(child, depth + 1),
                    )}
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Browse repository paths</DialogTitle>
                    <DialogDescription>
                        Select paths to add to include or exclude list. Folders
                        use glob (e.g. src/**).
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 min-h-[300px] max-h-[400px] rounded-md border">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Icons.loader className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {error && !loading && (
                        <div className="p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {!loading && !error && tree.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">
                            No files found.
                        </div>
                    )}
                    {!loading && !error && tree.length > 0 && (
                        <div className="p-2">
                            {tree.map((node) => renderNode(node, 0))}
                        </div>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddTo("include")}
                        disabled={loading || selected.size === 0}
                    >
                        Add to include
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddTo("exclude")}
                        disabled={loading || selected.size === 0}
                    >
                        Add to exclude
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
