import { randomUUID } from "crypto";

export function generateLinearPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const deliveryId = randomUUID();
  const now = new Date().toISOString();
  const actor = {
    id: randomUUID(),
    type: "user",
    name: "Product Engineer",
    email: "engineer@acme.com",
    url: "https://linear.app/acme/profiles/engineer",
  };

  switch (eventType) {
    case "issue_create": {
      const issueId = randomUUID();
      const teamId = randomUUID();
      return {
        payload: {
          action: "create",
          type: "Issue",
          actor,
          data: {
            id: issueId,
            createdAt: now,
            updatedAt: now,
            archivedAt: null,
            title: "Fix OAuth callback timeout under load",
            description: "Users report 504 errors when completing OAuth flow during peak traffic.",
            priority: 1,
            priorityLabel: "Urgent",
            stateId: randomUUID(),
            state: { id: randomUUID(), name: "Todo", type: "unstarted" },
            teamId,
            assigneeId: null,
            labelIds: [randomUUID()],
            identifier: "ENG-142",
            url: `https://linear.app/acme/issue/ENG-142`,
          },
          url: `https://linear.app/acme/issue/ENG-142`,
          createdAt: now,
          organizationId: randomUUID(),
          webhookTimestamp: Date.now(),
          webhookId: randomUUID(),
        },
        headers: {
          "Linear-Delivery": deliveryId,
          "Linear-Event": "Issue",
          "Content-Type": "application/json",
        },
      };
    }

    case "issue_update": {
      const issueId = randomUUID();
      return {
        payload: {
          action: "update",
          type: "Issue",
          actor,
          data: {
            id: issueId,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: now,
            title: "Fix OAuth callback timeout under load",
            description: "Users report 504 errors when completing OAuth flow.",
            priority: 2,
            priorityLabel: "High",
            stateId: randomUUID(),
            state: { id: randomUUID(), name: "In Progress", type: "started" },
            assigneeId: actor.id,
            identifier: "ENG-142",
            url: `https://linear.app/acme/issue/ENG-142`,
          },
          url: `https://linear.app/acme/issue/ENG-142`,
          createdAt: now,
          organizationId: randomUUID(),
          webhookTimestamp: Date.now(),
          webhookId: randomUUID(),
          updatedFrom: {
            stateId: randomUUID(),
            state: { name: "Todo" },
            assigneeId: null,
          },
        },
        headers: {
          "Linear-Delivery": deliveryId,
          "Linear-Event": "Issue",
          "Content-Type": "application/json",
        },
      };
    }

    case "comment_create": {
      const commentId = randomUUID();
      const issueId = randomUUID();
      return {
        payload: {
          action: "create",
          type: "Comment",
          actor,
          data: {
            id: commentId,
            createdAt: now,
            updatedAt: now,
            archivedAt: null,
            body: "Reproducing in staging. Looks like the timeout is 10s but OAuth providers can take 15s+ during peak. Suggest bumping to 30s.",
            edited: false,
            issueId,
            userId: actor.id,
          },
          url: `https://linear.app/acme/issue/ENG-142#comment-${commentId.slice(0, 8)}`,
          createdAt: now,
          organizationId: randomUUID(),
          webhookTimestamp: Date.now(),
          webhookId: randomUUID(),
        },
        headers: {
          "Linear-Delivery": deliveryId,
          "Linear-Event": "Comment",
          "Content-Type": "application/json",
        },
      };
    }

    default:
      throw new Error(`Unknown Linear event type: ${eventType}`);
  }
}
