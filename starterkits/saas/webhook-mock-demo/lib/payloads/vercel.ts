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
              error: {
                code: "BUILD_FAILED",
                message: "Build failed: npm install error",
              },
            },
          },
        },
        headers: {},
      };
    }

    default:
      throw new Error(`Unknown Vercel event type: ${eventType}`);
  }
}
