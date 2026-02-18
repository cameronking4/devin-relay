import { randomUUID } from "crypto";

/**
 * Azure DevOps Service Hooks / Webhooks payload format.
 * Payload: eventType, resource, resourceVersion, resourceContainers, createdDate, message, detailedMessage
 * @see https://learn.microsoft.com/en-us/azure/devops/service-hooks/services/webhooks
 * @see https://learn.microsoft.com/en-us/azure/devops/service-hooks/events
 */
function basePayload(eventType: string, resource: unknown) {
  const projectId = randomUUID();
  const orgId = randomUUID().replace(/-/g, "").slice(0, 32);
  return {
    eventType,
    publisherId: "tfs",
    scope: 1,
    createdDate: new Date().toISOString(),
    message: {
      text: `Event ${eventType} occurred`,
      html: `<p>Event ${eventType} occurred</p>`,
      markdown: `Event **${eventType}** occurred`,
    },
    detailedMessage: {
      text: `Event ${eventType} occurred`,
      html: `<p>Event ${eventType} occurred</p>`,
      markdown: `Event **${eventType}** occurred`,
    },
    resource,
    resourceVersion: "1.0",
    resourceContainers: {
      collection: { id: orgId },
      account: { id: orgId },
      project: { id: projectId },
    },
  };
}

export function generateAzureDevOpsPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const headers = { "Content-Type": "application/json" };

  switch (eventType) {
    case "build.complete": {
      const result = Math.random() > 0.2 ? "succeeded" : "failed";
      const buildId = Math.floor(10000 + Math.random() * 90000);
      const resource = {
        id: buildId,
        buildNumber: `20240218.${buildId}`,
        status: "completed",
        result,
        sourceBranch: "refs/heads/main",
        sourceVersion: randomUUID().replace(/-/g, "").slice(0, 40),
        definition: {
          id: Math.floor(1 + Math.random() * 100),
          name: "CI",
          path: "\\",
          queueStatus: "enabled",
          type: 2,
        },
        project: { id: randomUUID(), name: "MyProject" },
        requestedFor: {
          displayName: "Jane Doe",
          id: randomUUID(),
          uniqueName: "jane@contoso.com",
        },
        startTime: new Date(Date.now() - 120000).toISOString(),
        finishTime: now,
        uri: `vstfs:///Build/Build/${buildId}`,
        url: `https://dev.azure.com/contoso/MyProject/_apis/build/Builds/${buildId}`,
        reason: 1,
        repository: {
          id: randomUUID(),
          name: "MyRepo",
          type: "TfsGit",
          url: "https://dev.azure.com/contoso/MyProject/_git/MyRepo",
        },
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    case "git.push": {
      const pushId = Math.floor(10000 + Math.random() * 90000);
      const commitId = randomUUID().replace(/-/g, "").slice(0, 40);
      const resource = {
        refUpdates: [
          {
            name: "refs/heads/main",
            oldObjectId: "0".repeat(40),
            newObjectId: commitId,
          },
        ],
        repository: {
          id: randomUUID(),
          name: "MyRepo",
          url: "https://dev.azure.com/contoso/MyProject/_git/MyRepo",
          project: { id: randomUUID(), name: "MyProject" },
          defaultBranch: "refs/heads/main",
        },
        pushedBy: {
          displayName: "Jane Doe",
          id: randomUUID(),
          uniqueName: "jane@contoso.com",
        },
        pushId,
        date: now,
        pushes: [
          {
            pushId,
            date: now,
            pushedBy: { displayName: "Jane Doe", id: randomUUID() },
            refUpdates: [{ name: "refs/heads/main", newObjectId: commitId }],
            commits: [
              {
                commitId,
                author: { name: "Jane Doe", email: "jane@contoso.com", date: now },
                committer: { name: "Jane Doe", email: "jane@contoso.com", date: now },
                comment: "Add feature X",
                changeCounts: { Add: 3, Edit: 1, Delete: 0 },
                url: `https://dev.azure.com/contoso/MyProject/_git/MyRepo/commit/${commitId}`,
              },
            ],
          },
        ],
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    case "git.pullrequest.created": {
      const prId = Math.floor(100 + Math.random() * 9000);
      const resource = {
        repository: {
          id: randomUUID(),
          name: "MyRepo",
          url: "https://dev.azure.com/contoso/MyProject/_git/MyRepo",
          project: { id: randomUUID(), name: "MyProject" },
        },
        pullRequestId: prId,
        status: "active",
        createdBy: { displayName: "Jane Doe", id: randomUUID(), uniqueName: "jane@contoso.com" },
        creationDate: now,
        title: "Add user authentication",
        description: "Implements OAuth2 login flow",
        sourceRefName: "refs/heads/feature/auth",
        targetRefName: "refs/heads/main",
        mergeStatus: "succeeded",
        isDraft: false,
        reviewers: [{ displayName: "John Smith", id: randomUUID(), vote: 0 }],
        url: `https://dev.azure.com/contoso/MyProject/_git/MyRepo/pullrequest/${prId}`,
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    case "git.pullrequest.updated": {
      const prId = Math.floor(100 + Math.random() * 9000);
      const resource = {
        repository: {
          id: randomUUID(),
          name: "MyRepo",
          url: "https://dev.azure.com/contoso/MyProject/_git/MyRepo",
          project: { id: randomUUID(), name: "MyProject" },
        },
        pullRequestId: prId,
        status: "active",
        createdBy: { displayName: "Jane Doe", id: randomUUID() },
        creationDate: new Date(Date.now() - 86400000).toISOString(),
        title: "Add user authentication",
        description: "Implements OAuth2 login flow",
        sourceRefName: "refs/heads/feature/auth",
        targetRefName: "refs/heads/main",
        mergeStatus: "succeeded",
        isDraft: false,
        lastMergeSourceCommit: { commitId: randomUUID().replace(/-/g, "").slice(0, 40) },
        reviewers: [{ displayName: "John Smith", id: randomUUID(), vote: 10 }],
        url: `https://dev.azure.com/contoso/MyProject/_git/MyRepo/pullrequest/${prId}`,
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    case "workitem.created": {
      const workItemId = Math.floor(1000 + Math.random() * 90000);
      const resource = {
        id: workItemId,
        rev: 1,
        fields: {
          "System.Id": workItemId,
          "System.Title": "Implement dark mode",
          "System.WorkItemType": "Task",
          "System.State": "New",
          "System.CreatedDate": now,
          "System.CreatedBy": { displayName: "Jane Doe", uniqueName: "jane@contoso.com" },
          "System.TeamProject": "MyProject",
          "System.AreaPath": "MyProject",
          "System.IterationPath": "MyProject\\Sprint 1",
        },
        _links: {
          html: { href: `https://dev.azure.com/contoso/MyProject/_workitems/edit/${workItemId}` },
        },
        url: `https://dev.azure.com/contoso/MyProject/_apis/wit/workItems/${workItemId}`,
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    case "workitem.updated": {
      const workItemId = Math.floor(1000 + Math.random() * 90000);
      const resource = {
        id: workItemId,
        rev: 3,
        fields: {
          "System.Id": workItemId,
          "System.Title": "Implement dark mode",
          "System.WorkItemType": "Task",
          "System.State": "Active",
          "System.ChangedDate": now,
          "System.ChangedBy": { displayName: "John Smith", uniqueName: "john@contoso.com" },
          "System.TeamProject": "MyProject",
          "System.AssignedTo": { displayName: "Jane Doe", uniqueName: "jane@contoso.com" },
          "Microsoft.VSTS.Common.StateChangeDate": now,
        },
        _links: {
          html: { href: `https://dev.azure.com/contoso/MyProject/_workitems/edit/${workItemId}` },
        },
        url: `https://dev.azure.com/contoso/MyProject/_apis/wit/workItems/${workItemId}`,
        revision: { id: 3, rev: 3, fields: { "System.State": { oldValue: "New", newValue: "Active" } } },
      };
      return { payload: basePayload(eventType, resource), headers };
    }

    default:
      throw new Error(`Unknown Azure DevOps event type: ${eventType}`);
  }
}
