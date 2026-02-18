"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { getLinkedProviders, getGitHubRepos, type GitHubRepo } from "@/server/actions/github";
import { toast } from "sonner";

export function GithubRepoInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (repo: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [hasGithub, setHasGithub] = useState<boolean | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLinkedProviders()
            .then((providers) => setHasGithub(providers.includes("github")))
            .catch(() => setHasGithub(false));
    }, []);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen && hasGithub) {
            setLoading(true);
            setError(null);
            getGitHubRepos()
                .then((result) => {
                    if ("error" in result) {
                        setError(result.error);
                        setRepos([]);
                        toast.error(result.error);
                    } else {
                        setRepos(result.repos);
                    }
                })
                .finally(() => setLoading(false));
        }
    };

    const handleSelect = (fullName: string) => {
        onChange(fullName);
        setOpen(false);
    };

    return (
        <div className="flex gap-2">
            <Input
                id="githubRepo"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="owner/repo (e.g. acme-inc/my-app)"
                required
                className="flex-1"
            />
            {hasGithub && (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(true)}
                        disabled={loading}
                    >
                        <Icons.gitHub className="mr-1.5 h-4 w-4 fill-foreground" />
                        Browse
                    </Button>
                    <CommandDialog open={open} onOpenChange={handleOpenChange}>
                        <CommandInput placeholder="Search repositories…" />
                        <CommandList>
                            <CommandEmpty>
                                {loading
                                    ? "Loading…"
                                    : error
                                      ? error
                                      : "No repositories found."}
                            </CommandEmpty>
                            {!error && repos.length > 0 && (
                                <CommandGroup heading="Your repositories">
                                    {repos.map((repo) => (
                                        <CommandItem
                                            key={repo.full_name}
                                            value={`${repo.full_name} ${repo.name} ${repo.owner.login}`}
                                            onSelect={() =>
                                                handleSelect(repo.full_name)
                                            }
                                        >
                                            <span className="font-medium">
                                                {repo.full_name}
                                            </span>
                                            {repo.private && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    (private)
                                                </span>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </CommandDialog>
                </>
            )}
        </div>
    );
}
