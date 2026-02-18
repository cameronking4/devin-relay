"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RepoTreePickerDialog } from "./repo-tree-picker-dialog";
import { FolderOpen } from "lucide-react";

export function PathPolicyConfig({
    includePaths,
    excludePaths,
    onChange,
    githubRepo,
}: {
    includePaths: string[];
    excludePaths: string[];
    onChange: (includePaths: string[], excludePaths: string[]) => void;
    /** owner/repo - when set and browsable (user has GitHub or repo is public), show Browse button */
    githubRepo?: string;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const includeText = includePaths.join("\n");
    const excludeText = excludePaths.join("\n");

    const [owner, repo] = (() => {
        const trimmed = githubRepo?.trim() ?? "";
        const idx = trimmed.indexOf("/");
        if (idx < 0) return ["", ""];
        return [trimmed.slice(0, idx), trimmed.slice(idx + 1)];
    })();
    const canBrowse = Boolean(owner && repo);

    const handleIncludeChange = (text: string) => {
        const paths = text
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean);
        onChange(paths, excludePaths);
    };

    const handleExcludeChange = (text: string) => {
        const paths = text
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean);
        onChange(includePaths, paths);
    };

    const handleAddToInclude = (paths: string[]) => {
        const merged = [...new Set([...includePaths, ...paths])];
        onChange(merged, excludePaths);
    };

    const handleAddToExclude = (paths: string[]) => {
        const merged = [...new Set([...excludePaths, ...paths])];
        onChange(includePaths, merged);
    };

    return (
        <div className="space-y-4">
            {canBrowse && (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPickerOpen(true)}
                        className="gap-2"
                    >
                        <FolderOpen className="h-4 w-4" />
                        Browse repository paths
                    </Button>
                    <span className="text-muted-foreground text-xs">
                        Select paths from the source tree
                    </span>
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="includePaths">Include paths (allowlist)</Label>
                    <Textarea
                        id="includePaths"
                        value={includeText}
                        onChange={(e) => handleIncludeChange(e.target.value)}
                        placeholder={"src/**\nlib/**"}
                        rows={3}
                        className="font-mono text-sm"
                    />
                    <p className="text-muted-foreground text-xs">
                        One path per line. Devin will only work within these
                        paths. Globs supported (e.g. src/**).
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="excludePaths">Exclude paths</Label>
                    <Textarea
                        id="excludePaths"
                        value={excludeText}
                        onChange={(e) => handleExcludeChange(e.target.value)}
                        placeholder={"node_modules/**\n*.lock"}
                        rows={3}
                        className="font-mono text-sm"
                    />
                    <p className="text-muted-foreground text-xs">
                        One path per line. Devin will not touch these paths.
                    </p>
                </div>
            </div>
            {canBrowse && (
                <RepoTreePickerDialog
                    open={pickerOpen}
                    onOpenChange={setPickerOpen}
                    owner={owner}
                    repo={repo}
                    onAddToInclude={handleAddToInclude}
                    onAddToExclude={handleAddToExclude}
                />
            )}
        </div>
    );
}
