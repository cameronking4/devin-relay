import { generateSentryPayload } from "./sentry";
import { generateVercelPayload } from "./vercel";
import { generatePrometheusPayload } from "./prometheus";
import { generateDatadogPayload } from "./datadog";
import { generateGrafanaPayload } from "./grafana";
import { generatePagerDutyPayload } from "./pagerduty";
import { generateGitHubPayload } from "./github";
import { generateVantaPayload } from "./vanta";
import { generateCrowdStrikePayload } from "./crowdstrike";
import { generateLinearPayload } from "./linear";
import { generatePostHogPayload } from "./posthog";
import { generateLogflarePayload } from "./logflare";
import { generateOtelPayload } from "./otel";
import { generateAzureMonitorPayload } from "./azure-monitor";
import { generateAzureDevOpsPayload } from "./azure-devops";
import { generateTypeformPayload } from "./typeform";
import { generateCloudWatchPayload } from "./cloudwatch";

export function generatePayload(
  service: string,
  eventType: string,
): { payload: unknown; headers: Record<string, string> } {
  switch (service.toLowerCase()) {
    case "sentry":
      return generateSentryPayload(eventType);
    case "vercel":
      return generateVercelPayload(eventType);
    case "prometheus":
      return generatePrometheusPayload(eventType);
    case "datadog":
      return generateDatadogPayload(eventType);
    case "grafana":
      return generateGrafanaPayload(eventType);
    case "pagerduty":
      return generatePagerDutyPayload(eventType);
    case "github":
      return generateGitHubPayload(eventType);
    case "vanta":
      return generateVantaPayload(eventType);
    case "crowdstrike":
      return generateCrowdStrikePayload(eventType);
    case "linear":
      return generateLinearPayload(eventType);
    case "posthog":
      return generatePostHogPayload(eventType);
    case "logflare":
      return generateLogflarePayload(eventType);
    case "otel":
      return generateOtelPayload(eventType);
    case "azure_monitor":
      return generateAzureMonitorPayload(eventType);
    case "azure_devops":
      return generateAzureDevOpsPayload(eventType);
    case "typeform":
      return generateTypeformPayload(eventType);
    case "cloudwatch":
      return generateCloudWatchPayload(eventType);
    default:
      throw new Error(`Unknown service: ${service}`);
  }
}
