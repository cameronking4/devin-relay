import { randomUUID } from "crypto";

export function generateSentryPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const baseUrl = "https://sentry.io";
  const orgSlug = "example-org";
  const projectSlug = "my-app";
  const issueId = Math.floor(Math.random() * 1000000000).toString();
  const eventId = randomUUID();

  switch (eventType) {
    case "issue_alert": {
      return {
        payload: {
          action: "triggered",
          data: {
            event: {
              url: `${baseUrl}/api/0/projects/${orgSlug}/${projectSlug}/events/${eventId}/`,
              web_url: `${baseUrl}/${orgSlug}/${projectSlug}/issues/${issueId}/?event=latest`,
              issue_url: `${baseUrl}/api/0/issues/${issueId}/`,
              issue_id: issueId,
              type: "error",
              message: "A simulated error occurred: Cannot read property 'x' of undefined",
              timestamp: new Date().toISOString(),
            },
            triggered_rule: "High Error Rate Alert",
            issue_alert: {
              title: "High Error Rate Alert",
              settings: {
                routing_key: "webhook-test",
                service_name: "relay-test",
              },
            },
          },
        },
        headers: {
          "Sentry-Hook-Resource": "event_alert",
        },
      };
    }

    case "metric_alert": {
      const actions = ["critical", "warning", "resolved"] as const;
      const action = actions[Math.floor(Math.random() * actions.length)];

      return {
        payload: {
          action,
          actor: {
            id: "sentry",
            name: "Sentry",
            type: "application",
          },
          data: {
            description_text: "1000 events in the last 10 minutes\nFilter: level:error",
            description_title: `${action === "resolved" ? "Resolved" : action === "critical" ? "Critical" : "Warning"}: Too many errors`,
            metric_alert: {
              alert_rule: {
                aggregate: "count()",
                created_by: null,
                dataset: "events",
                date_created: new Date().toISOString(),
                date_modified: new Date().toISOString(),
                environment: null,
                id: "7",
                include_all_projects: false,
                name: "Too many errors",
                organization_id: "5",
                projects: [projectSlug],
                query: "level:error",
                resolution: 1,
                resolve_threshold: null,
                status: action === "resolved" ? 0 : 1,
                threshold_period: 1,
                threshold_type: 0,
                time_window: 10,
                triggers: [],
              },
              date_closed: action === "resolved" ? new Date().toISOString() : null,
              date_created: new Date().toISOString(),
              date_detected: new Date().toISOString(),
              date_started: new Date().toISOString(),
              id: "4",
              identifier: "1",
              organization_id: "5",
              projects: [projectSlug],
              status: action === "resolved" ? 2 : action === "critical" ? 0 : 1,
              status_method: 3,
              title: "High Error Rate Alert",
              type: 2,
            },
            web_url: `${baseUrl}/organizations/${orgSlug}/alerts/1/`,
          },
          installation: {
            uuid: randomUUID(),
          },
        },
        headers: {
          "Sentry-Hook-Resource": "metric_alert",
        },
      };
    }

    case "issue_created": {
      return {
        payload: {
          action: "created",
          installation: {
            uuid: randomUUID(),
          },
          data: {
            issue: {
              url: `${baseUrl}/api/0/organizations/${orgSlug}/issues/${issueId}/`,
              web_url: `${baseUrl}/${orgSlug}/issues/${issueId}/`,
              project_url: `${baseUrl}/${orgSlug}/issues/?project=4509877862268928`,
              id: issueId,
              shareId: null,
              shortId: "JS-1",
              title: "Error: Cannot read property 'x' of undefined",
              culprit: "app.js:42",
              permalink: `${baseUrl}/${orgSlug}/issues/${issueId}/`,
              logger: "javascript",
              level: "error",
              status: "unresolved",
              statusDetails: {},
              substatus: "new",
              isPublic: false,
              platform: "javascript",
              project: {
                id: "112313123123134",
                name: projectSlug,
                slug: projectSlug,
                platform: "javascript",
              },
              type: "default",
              metadata: {
                title: "Error: Cannot read property 'x' of undefined",
                sdk: {
                  name: "sentry.javascript.browser",
                  name_normalized: "sentry.javascript.browser",
                },
                severity: 1,
                severity_reason: "log_level_error",
                initial_priority: 50,
              },
              numComments: 0,
              assignedTo: null,
              isBookmarked: false,
              isSubscribed: false,
              subscriptionDetails: null,
              hasSeen: false,
              annotations: [],
              issueType: "error",
              issueCategory: "error",
              priority: "medium",
              priorityLockedAt: null,
              seerFixabilityScore: null,
              seerAutofixLastTriggered: null,
              isUnhandled: false,
              count: "1",
              userCount: 1,
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
            },
          },
          actor: {
            type: "application",
            id: "example-app",
            name: "Example App",
          },
        },
        headers: {
          "Sentry-Hook-Resource": "issue",
        },
      };
    }

    case "issue_resolved": {
      return {
        payload: {
          action: "resolved",
          installation: { uuid: randomUUID() },
          data: {
            issue: {
              url: `${baseUrl}/api/0/organizations/${orgSlug}/issues/${issueId}/`,
              web_url: `${baseUrl}/${orgSlug}/issues/${issueId}/`,
              project_url: `${baseUrl}/${orgSlug}/issues/?project=4509877862268928`,
              id: issueId,
              shareId: null,
              shortId: "PROD-2K",
              title: "TypeError: Cannot read property 'userId' of null",
              culprit: "auth.middleware.ts:87",
              permalink: `${baseUrl}/${orgSlug}/issues/${issueId}/`,
              logger: "node",
              level: "error",
              status: "resolved",
              statusDetails: { inRelease: "1.2.3", inNextRelease: false },
              substatus: "resolved",
              isPublic: false,
              platform: "node",
              project: {
                id: "112313123123134",
                name: projectSlug,
                slug: projectSlug,
                platform: "node",
              },
              type: "default",
              metadata: {
                title: "TypeError: Cannot read property 'userId' of null",
                sdk: { name: "sentry.javascript.node", name_normalized: "sentry.javascript.node" },
                severity: 1,
                severity_reason: "log_level_error",
                initial_priority: 50,
              },
              numComments: 2,
              assignedTo: { id: randomUUID(), type: "user", email: "dev@example.com", name: "Dev User" },
              issueType: "error",
              issueCategory: "error",
              priority: "medium",
              count: "47",
              userCount: 12,
              firstSeen: new Date(Date.now() - 86400000 * 2).toISOString(),
              lastSeen: new Date().toISOString(),
            },
          },
          actor: { type: "user", id: randomUUID(), name: "Dev User", email: "dev@example.com" },
        },
        headers: { "Sentry-Hook-Resource": "issue" },
      };
    }

    case "issue_assigned": {
      return {
        payload: {
          action: "assigned",
          installation: { uuid: randomUUID() },
          data: {
            issue: {
              url: `${baseUrl}/api/0/organizations/${orgSlug}/issues/${issueId}/`,
              web_url: `${baseUrl}/${orgSlug}/issues/${issueId}/`,
              id: issueId,
              shortId: "API-1Z",
              title: "Database connection pool exhausted",
              culprit: "db.js:204",
              status: "unresolved",
              substatus: "ongoing",
              project: { name: projectSlug, slug: projectSlug },
              assignedTo: {
                id: randomUUID(),
                type: "user",
                email: "oncall@example.com",
                name: "On-Call Engineer",
              },
              priority: "high",
              count: "156",
              userCount: 23,
              lastSeen: new Date().toISOString(),
            },
          },
          actor: { type: "user", id: randomUUID(), name: "Team Lead", email: "lead@example.com" },
        },
        headers: { "Sentry-Hook-Resource": "issue" },
      };
    }

    default:
      throw new Error(`Unknown Sentry event type: ${eventType}`);
  }
}
