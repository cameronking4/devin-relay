import { generateSentryPayload } from "./sentry";
import { generateVercelPayload } from "./vercel";
import { generatePrometheusPayload } from "./prometheus";
import { generateDatadogPayload } from "./datadog";
import { generateGrafanaPayload } from "./grafana";
import { generatePagerDutyPayload } from "./pagerduty";
import { generateGitHubPayload } from "./github";
import { generateStripePayload } from "./stripe";
import { generateSupabasePayload } from "./supabase";
import { generateLinearPayload } from "./linear";

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
    case "stripe":
      return generateStripePayload(eventType);
    case "supabase":
      return generateSupabasePayload(eventType);
    case "linear":
      return generateLinearPayload(eventType);
    default:
      throw new Error(`Unknown service: ${service}`);
  }
}
