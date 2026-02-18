import { randomUUID } from "crypto";

const SHORT_SHA = () => randomUUID().replace(/-/g, "").slice(0, 7);
const LONG_SHA = () => randomUUID().replace(/-/g, "").slice(0, 40);

export function generateGitHubPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const repoId = Math.floor(Math.random() * 100000000);
  const baseRepo = {
    id: repoId,
    name: "my-app",
    full_name: "acme-corp/my-app",
    private: false,
    html_url: `https://github.com/acme-corp/my-app`,
    clone_url: `https://github.com/acme-corp/my-app.git`,
    default_branch: "main",
  };

  const baseSender = {
    login: "dev-engineer",
    id: 12345,
    avatar_url: "https://avatars.githubusercontent.com/u/12345",
    type: "User",
  };

  switch (eventType) {
    case "push": {
      const sha = LONG_SHA();
      const commitMessage = "feat: add user authentication flow";
      return {
        payload: {
          ref: "refs/heads/main",
          before: "abc123def456",
          after: sha,
          repository: baseRepo,
          pusher: { name: "dev-engineer", email: "dev@acme.com" },
          sender: baseSender,
          created: false,
          deleted: false,
          forced: false,
          base_ref: null,
          compare: `https://github.com/acme-corp/my-app/compare/abc123...${sha.slice(0, 7)}`,
          commits: [
            {
              id: sha,
              tree_id: LONG_SHA(),
              distinct: true,
              message: commitMessage,
              timestamp: new Date().toISOString(),
              url: `https://github.com/acme-corp/my-app/commit/${sha}`,
              author: { name: "Dev Engineer", email: "dev@acme.com", username: "dev-engineer" },
              committer: { name: "Dev Engineer", email: "dev@acme.com", username: "dev-engineer" },
              added: ["src/auth/index.ts"],
              removed: [],
              modified: ["package.json"],
            },
          ],
          head_commit: {
            id: sha,
            message: commitMessage,
            timestamp: new Date().toISOString(),
            author: { name: "Dev Engineer", email: "dev@acme.com" },
          },
        },
        headers: { "X-GitHub-Event": "push" },
      };
    }

    case "pull_request": {
      const action = ["opened", "closed", "synchronize"][Math.floor(Math.random() * 3)];
      const prNumber = Math.floor(Math.random() * 500) + 1;
      return {
        payload: {
          action,
          number: prNumber,
          pull_request: {
            id: 123456789,
            number: prNumber,
            state: action === "closed" ? "closed" : "open",
            title: "Add rate limiting to API endpoints",
            body: "Implements token bucket rate limiting for /api/* routes.",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            closed_at: action === "closed" ? new Date().toISOString() : null,
            merged_at: action === "closed" ? new Date().toISOString() : null,
            merge_commit_sha: action === "closed" ? LONG_SHA() : null,
            head: { ref: "feature/rate-limit", sha: LONG_SHA(), repo: baseRepo },
            base: { ref: "main", sha: LONG_SHA(), repo: baseRepo },
            user: baseSender,
            html_url: `https://github.com/acme-corp/my-app/pull/${prNumber}`,
          },
          repository: baseRepo,
          sender: baseSender,
        },
        headers: { "X-GitHub-Event": "pull_request" },
      };
    }

    case "workflow_run": {
      const conclusion = ["success", "failure"][Math.floor(Math.random() * 2)];
      const runId = Math.floor(Math.random() * 100000000);
      return {
        payload: {
          action: "completed",
          workflow_run: {
            id: runId,
            name: "CI",
            path: ".github/workflows/ci.yml",
            display_title: "CI",
            run_number: Math.floor(Math.random() * 100) + 1,
            event: "push",
            conclusion,
            status: "completed",
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            run_attempt: 1,
            head_branch: "main",
            head_sha: LONG_SHA(),
            html_url: `https://github.com/acme-corp/my-app/actions/runs/${runId}`,
            jobs_url: `https://api.github.com/repos/acme-corp/my-app/actions/jobs/${runId}`,
            workflow_id: 123456,
            repository: baseRepo,
            head_repository: baseRepo,
          },
          repository: baseRepo,
          sender: baseSender,
        },
        headers: { "X-GitHub-Event": "workflow_run" },
      };
    }

    case "deployment_status": {
      const state = ["success", "failure", "pending"][Math.floor(Math.random() * 3)];
      const deploymentId = Math.floor(Math.random() * 1000000);
      return {
        payload: {
          deployment: {
            url: `https://api.github.com/repos/acme-corp/my-app/deployments/${deploymentId}`,
            id: deploymentId,
            node_id: "MDEwOkRlcGxveW1lbnQxMjM0NTY=",
            task: "deploy",
            original_environment: "production",
            environment: "production",
            ref: "main",
            sha: LONG_SHA(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: "Deploy to production",
          },
          deployment_status: {
            id: Math.floor(Math.random() * 100000000),
            state,
            creator: baseSender,
            description: state === "success" ? "Deployment finished successfully" : state === "failure" ? "Deployment failed" : "Deployment in progress",
            environment: "production",
            target_url: "https://my-app-acme.vercel.app",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deployment_url: `https://api.github.com/repos/acme-corp/my-app/deployments/${deploymentId}`,
            log_url: `https://github.com/acme-corp/my-app/actions/runs/${deploymentId}`,
          },
          repository: baseRepo,
          sender: baseSender,
        },
        headers: { "X-GitHub-Event": "deployment_status" },
      };
    }

    case "release": {
      const tagName = "v1.2.3";
      return {
        payload: {
          action: "published",
          release: {
            id: Math.floor(Math.random() * 100000000),
            tag_name: tagName,
            name: "Release 1.2.3 - Performance improvements",
            body: "## What's changed\n- Fixed memory leak in auth middleware\n- Improved API response times",
            draft: false,
            prerelease: false,
            created_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            author: baseSender,
            assets: [],
            tarball_url: `https://api.github.com/repos/acme-corp/my-app/tarball/${tagName}`,
            zipball_url: `https://api.github.com/repos/acme-corp/my-app/zipball/${tagName}`,
            target_commitish: "main",
          },
          repository: baseRepo,
          sender: baseSender,
        },
        headers: { "X-GitHub-Event": "release" },
      };
    }

    case "issue": {
      const issueNumber = Math.floor(Math.random() * 200) + 1;
      return {
        payload: {
          action: "opened",
          issue: {
            id: 123456789,
            number: issueNumber,
            state: "open",
            title: "Database connection pool exhausted under load",
            body: "We're seeing connection pool exhaustion when traffic spikes above 1k RPS.",
            user: baseSender,
            labels: [{ name: "bug", color: "d73a4a" }, { name: "priority:high", color: "b60205" }],
            assignees: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            html_url: `https://github.com/acme-corp/my-app/issues/${issueNumber}`,
          },
          repository: baseRepo,
          sender: baseSender,
        },
        headers: { "X-GitHub-Event": "issues" },
      };
    }

    default:
      throw new Error(`Unknown GitHub event type: ${eventType}`);
  }
}
