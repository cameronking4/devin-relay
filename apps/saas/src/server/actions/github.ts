"use server";

import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { getUser } from "@/server/auth";
import { protectedProcedure } from "@/server/procedures";
import { and, eq } from "drizzle-orm";

export type GitHubRepo = {
    full_name: string;
    name: string;
    owner: { login: string };
    private: boolean;
};

/**
 * Returns the OAuth providers the current user has linked (e.g. ["github", "google"]).
 */
export async function getLinkedProviders(): Promise<string[]> {
    const { user } = await protectedProcedure();

    const linked = await db
        .select({ provider: accounts.provider })
        .from(accounts)
        .where(eq(accounts.userId, user.id));

    return linked.map((a) => a.provider);
}

/**
 * Fetches GitHub repositories for the current user using their stored OAuth access token.
 * Only works when the user has signed in with GitHub and the token has repo scope.
 */
export async function getGitHubRepos(): Promise<
    { repos: GitHubRepo[] } | { error: string }
> {
    const { user } = await protectedProcedure();

    const [account] = await db
        .select({
            accessToken: accounts.access_token,
        })
        .from(accounts)
        .where(
            and(
                eq(accounts.userId, user.id),
                eq(accounts.provider, "github"),
            ),
        )
        .limit(1);

    if (!account?.accessToken) {
        return {
            error: "GitHub account not linked. Sign in with GitHub to browse repos.",
        };
    }

    try {
        const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
            headers: {
                Authorization: `Bearer ${account.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                return {
                    error: "GitHub token expired. Sign out and sign in with GitHub again to refresh.",
                };
            }
            const text = await res.text();
            return {
                error: `GitHub API error: ${res.status} ${text.slice(0, 100)}`,
            };
        }

        const repos = (await res.json()) as GitHubRepo[];
        return { repos };
    } catch (e) {
        return {
            error:
                e instanceof Error ? e.message : "Failed to fetch GitHub repos",
        };
    }
}

export type GitHubTreeEntry = {
    path: string;
    type: "blob" | "tree";
};

/**
 * Fetches the repository file tree. Uses OAuth token if user has GitHub linked,
 * otherwise tries unauthenticated (works for public repos). Returns flat list
 * of paths for use in a tree viewer.
 */
export async function getGitHubRepoTree(
    owner: string,
    repo: string,
): Promise<
    | { tree: GitHubTreeEntry[]; truncated?: boolean }
    | { error: string }
> {
    const trimmedOwner = owner.trim();
    const trimmedRepo = repo.trim();
    if (!trimmedOwner || !trimmedRepo) {
        return { error: "Owner and repo are required" };
    }

    let accessToken: string | null = null;
    const user = await getUser();
    if (user) {
        const [account] = await db
            .select({ accessToken: accounts.access_token })
            .from(accounts)
            .where(
                and(eq(accounts.userId, user.id), eq(accounts.provider, "github")),
            )
            .limit(1);
        accessToken = account?.accessToken ?? null;
    }

    const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
    };
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
        const res = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(trimmedOwner)}/${encodeURIComponent(trimmedRepo)}/git/trees/HEAD?recursive=1`,
            { headers },
        );

        if (!res.ok) {
            if (res.status === 404) {
                return {
                    error: "Repository not found. Check owner/repo or sign in with GitHub for private repos.",
                };
            }
            if (res.status === 403) {
                return {
                    error: "Access denied. Sign in with GitHub to browse this repository.",
                };
            }
            const text = await res.text();
            return {
                error: `GitHub API error: ${res.status} ${text.slice(0, 150)}`,
            };
        }

        const data = (await res.json()) as {
            tree?: Array<{ path: string; type: string }>;
            truncated?: boolean;
        };
        const tree: GitHubTreeEntry[] = (data.tree ?? [])
            .filter((e) => e.path && e.type)
            .map((e) => ({
                path: e.path,
                type: e.type === "tree" ? "tree" : "blob",
            }));
        return { tree, truncated: data.truncated };
    } catch (e) {
        return {
            error:
                e instanceof Error ? e.message : "Failed to fetch repository tree",
        };
    }
}
