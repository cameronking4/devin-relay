import { randomUUID } from "crypto";

export function generateVercelPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const deploymentId = `dpl_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
  const projectId = `prj_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
  const userId = `user_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
  const teamId = `team_${randomUUID().replace(/-/g, "").substring(0, 20)}`;
  const projectName = "my-app";
  const deploymentUrl = `https://${projectName}-${deploymentId.substring(0, 8)}.vercel.app`;

  const basePayload = {
    id: `evt_${randomUUID().replace(/-/g, "").substring(0, 20)}`,
    createdAt: Date.now(),
    region: "iad1",
    payload: {
      team: {
        id: teamId,
      },
      user: {
        id: userId,
      },
      alias: [deploymentUrl],
      deployment: {
        id: deploymentId,
        meta: {
          githubCommitSha: randomUUID().replace(/-/g, "").substring(0, 40),
          githubCommitMessage: "feat: implement new feature",
        },
        url: deploymentUrl,
        name: projectName,
      },
      links: {
        deployment: `https://vercel.com/my-team/${projectName}/deployments/${deploymentId}`,
        project: `https://vercel.com/my-team/${projectName}`,
      },
      project: {
        id: projectId,
      },
      plan: "pro",
      regions: ["sfo1", "iad1"],
    },
  };

  switch (eventType) {
    case "deployment_created": {
      return {
        payload: {
          ...basePayload,
          type: "deployment.created",
          payload: {
            ...basePayload.payload,
            target: "production",
          },
        },
        headers: {},
      };
    }

    case "deployment_ready": {
      return {
        payload: {
          ...basePayload,
          type: "deployment.ready",
          payload: {
            ...basePayload.payload,
            target: "production",
          },
        },
        headers: {},
      };
    }

    case "deployment_error": {
      return {
        payload: {
          ...basePayload,
          type: "deployment.error",
          payload: {
            ...basePayload.payload,
            target: "production",
            deployment: {
              ...basePayload.payload.deployment,
              state: "ERROR",
              readyState: "ERROR",
              error: {
                code: "BUILD_FAILED",
                message: "Build failed: Command \"pnpm run build\" exited with 1",
              },
            },
          },
        },
        headers: {},
      };
    }

    case "deployment_canceled": {
      return {
        payload: {
          ...basePayload,
          type: "deployment.canceled",
          payload: {
            ...basePayload.payload,
            target: "production",
            deployment: {
              ...basePayload.payload.deployment,
              state: "CANCELED",
              readyState: "CANCELED",
            },
          },
        },
        headers: {},
      };
    }

    case "alert_error_anomaly": {
      const teamId = `team_${randomUUID().replace(/-/g, "").substring(0, 14)}`;
      const projectId = `prj_${randomUUID().replace(/-/g, "").substring(0, 14)}`;
      const startedAt = Date.now() - 5 * 60 * 1000;
      return {
        payload: {
          id: `evt_${randomUUID().replace(/-/g, "").substring(0, 20)}`,
          type: "alerts.triggered",
          createdAt: Date.now(),
          region: "iad1",
          payload: {
            teamId,
            projectId,
            startedAt,
            projectSlug: "my-app",
            teamSlug: "acme",
            groupId: `grp_${randomUUID().replace(/-/g, "").substring(0, 14)}`,
            links: {
              observability: `https://vercel.com/acme/my-app/observability?from=${startedAt}`,
            },
            alerts: [
              {
                startedAt: new Date(startedAt).toISOString(),
                title: "High Error Rate",
                unit: "requests",
                formattedValues: { count: "1,247", average: "4.2%", zscore: "4.1" },
                count: 1247,
                average: 4.2,
                stddev: 1.1,
                zscore: 4.1,
                zscoreThreshold: 4.0,
                alertId: `alert_${randomUUID().replace(/-/g, "").substring(0, 14)}`,
                type: "error_anomaly",
                metric: "edge_requests_5xx",
              },
            ],
          },
        },
        headers: {},
      };
    }

    case "alert_usage_anomaly": {
      const teamId = `team_${randomUUID().replace(/-/g, "").substring(0, 14)}`;
      const projectId = `prj_${randomUUID().replace(/-/g, "").substring(0, 14)}`;
      const startedAt = Date.now() - 5 * 60 * 1000;
      return {
        payload: {
          id: `evt_${randomUUID().replace(/-/g, "").substring(0, 20)}`,
          type: "alerts.triggered",
          createdAt: Date.now(),
          region: "iad1",
          payload: {
            teamId,
            projectId,
            startedAt,
            projectSlug: "my-app",
            teamSlug: "acme",
            groupId: `grp_${randomUUID().replace(/-/g, "").substring(0, 14)}`,
            links: {
              observability: `https://vercel.com/acme/my-app/observability?from=${startedAt}`,
            },
            alerts: [
              {
                startedAt: new Date(startedAt).toISOString(),
                title: "High Usage",
                unit: "requests",
                formattedValues: { count: "12,450", average: "2,490/min", zscore: "4.3" },
                count: 12450,
                average: 2490,
                stddev: 520,
                zscore: 4.3,
                zscoreThreshold: 4.0,
                alertId: `alert_${randomUUID().replace(/-/g, "").substring(0, 14)}`,
                type: "usage_anomaly",
                metric: "edge_requests",
              },
            ],
          },
        },
        headers: {},
      };
    }

    default:
      throw new Error(`Unknown Vercel event type: ${eventType}`);
  }
}
