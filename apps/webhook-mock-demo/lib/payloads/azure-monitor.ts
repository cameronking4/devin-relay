import { randomUUID } from "crypto";

export function generateAzureMonitorPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const subscriptionId = randomUUID();
  const resourceGroup = "rg-production";
  const resourceId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Compute/virtualMachines/vm-api-01`;

  switch (eventType) {
    case "metric_alert": {
      const alertId = `${resourceId}/providers/Microsoft.AlertsManagement/alerts/${randomUUID()}`;
      return {
        payload: {
          schemaId: "azureMonitorCommonAlertSchema",
          data: {
            essentials: {
              alertId,
              alertRule: "High CPU Usage",
              severity: "Sev2",
              signalType: "Metrics",
              monitorCondition: "Fired",
              monitoringService: "Platform",
              alertTargetIDs: [resourceId],
              originAlertId: randomUUID(),
              firedDateTime: now,
              description: "CPU percentage greater than 80",
              essentialsVersion: "1.0",
              alertContextVersion: "1.0",
            },
            alertContext: {
              conditionType: "SingleResourceMultipleMetricCriteria",
              condition: {
                allOf: [
                  {
                    metricName: "Percentage CPU",
                    metricValue: 87.4,
                    threshold: "80",
                    operator: "GreaterThan",
                    timeAggregation: "Average",
                  },
                ],
              },
              resourceId,
              resourceName: "vm-api-01",
              resourceType: "Microsoft.Compute/virtualMachines",
              resourceGroup,
              subscriptionId,
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-Azure-Monitor-Event": "metric_alert" },
      };
    }

    case "log_alert": {
      const logResourceId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/log-analytics-prod`;
      const alertId = `${logResourceId}/providers/Microsoft.AlertsManagement/alerts/${randomUUID()}`;
      return {
        payload: {
          schemaId: "azureMonitorCommonAlertSchema",
          data: {
            essentials: {
              alertId,
              alertRule: "Error Count Spike",
              severity: "Sev2",
              signalType: "Log",
              monitorCondition: "Fired",
              monitoringService: "Log Alerts V2",
              alertTargetIDs: [logResourceId],
              originAlertId: randomUUID(),
              firedDateTime: now,
              description: "Error logs exceeded 100 in 5 minutes",
              essentialsVersion: "1.0",
              alertContextVersion: "1.0",
            },
            alertContext: {
              conditionType: "LogQueryCriteria",
              condition: {
                windowSize: "PT5M",
                searchQuery: "traces | where severityLevel >= 3 | summarize count() by bin(timestamp, 5m)",
                metricMeasureColumn: null,
                targetResourceTypes: "['Microsoft.OperationalInsights/workspaces']",
                operator: "GreaterThan",
                threshold: "100",
                timeAggregation: "Count",
                metricValue: 127,
              },
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-Azure-Monitor-Event": "log_alert" },
      };
    }

    case "activity_log": {
      const activityResourceId = `${resourceId}/providers/Microsoft.AlertsManagement/alerts/${randomUUID()}`;
      return {
        payload: {
          schemaId: "azureMonitorCommonAlertSchema",
          data: {
            essentials: {
              alertId: activityResourceId,
              alertRule: "VM Create/Delete Alert",
              severity: "Sev2",
              signalType: "Activity Log",
              monitorCondition: "Fired",
              monitoringService: "Activity Log - Administrative",
              alertTargetIDs: [resourceId],
              originAlertId: randomUUID(),
              firedDateTime: now,
              description: "Virtual machine was created or modified",
              essentialsVersion: "1.0",
              alertContextVersion: "1.0",
            },
            alertContext: {
              authorization: { action: "Microsoft.Compute/virtualMachines/write", scope: resourceId },
              channels: "Operation",
              caller: "devops@example.com",
              correlationId: randomUUID(),
              eventSource: "Administrative",
              eventTimestamp: now,
              operationName: "Microsoft.Compute/virtualMachines/write",
              resourceId,
              resourceGroupName: resourceGroup,
              resourceProviderName: "Microsoft.Compute",
              status: "Succeeded",
              subscriptionId,
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-Azure-Monitor-Event": "activity_log" },
      };
    }

    case "availability_test": {
      const webtestResourceId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Insights/webtests/api-health`;
      const alertId = `${webtestResourceId}/providers/Microsoft.AlertsManagement/alerts/${randomUUID()}`;
      return {
        payload: {
          schemaId: "azureMonitorCommonAlertSchema",
          data: {
            essentials: {
              alertId,
              alertRule: "Availability Test Failed",
              severity: "Sev1",
              signalType: "Log",
              monitorCondition: "Fired",
              monitoringService: "Application Insights",
              alertTargetIDs: [webtestResourceId],
              originAlertId: randomUUID(),
              firedDateTime: now,
              description: "https://api.example.com/health returned non-200",
              essentialsVersion: "1.0",
              alertContextVersion: "1.0",
            },
            alertContext: {
              conditionType: "Webtest",
              webtestName: "api-health-check",
              webtestId: randomUUID(),
              failedLocationCount: 2,
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-Azure-Monitor-Event": "webtest_alert" },
      };
    }

    case "smart_detection": {
      const appInsightsId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Insights/components/my-app`;
      const alertId = `${appInsightsId}/providers/Microsoft.AlertsManagement/alerts/${randomUUID()}`;
      return {
        payload: {
          schemaId: "azureMonitorCommonAlertSchema",
          data: {
            essentials: {
              alertId,
              alertRule: "Degradation in dependency duration",
              severity: "Sev2",
              signalType: "Log",
              monitorCondition: "Fired",
              monitoringService: "Application Insights - Smart Detection",
              alertTargetIDs: [appInsightsId],
              originAlertId: randomUUID(),
              firedDateTime: now,
              description: "Response time for database calls increased 3.2x",
              essentialsVersion: "1.0",
              alertContextVersion: "1.0",
            },
            alertContext: {
              ApplicationId: randomUUID(),
              ApplicationName: "my-app",
              detectedSignal: "dependency_duration_degradation",
              baselineDuration: 45,
              currentDuration: 144,
              dependencyType: "SQL",
            },
          },
        },
        headers: { "Content-Type": "application/json", "X-Azure-Monitor-Event": "smart_detection" },
      };
    }

    default:
      throw new Error(`Unknown Azure Monitor event type: ${eventType}`);
  }
}
