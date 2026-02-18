import { generateSentryPayload } from "./sentry";
import { generateVercelPayload } from "./vercel";
import { generatePrometheusPayload } from "./prometheus";
import { generateDatadogPayload } from "./datadog";
import { generateGrafanaPayload } from "./grafana";
import { generatePagerDutyPayload } from "./pagerduty";

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
    default:
      throw new Error(`Unknown service: ${service}`);
  }
}
