import { randomUUID } from "crypto";

export function generatePostHogPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const projectId = `phc_${randomUUID().replace(/-/g, "").substring(0, 14)}`;

  switch (eventType) {
    case "cohort_entered": {
      return {
        payload: {
          event: "cohort_alert",
          timestamp: now,
          project_id: projectId,
          payload: {
            cohort_id: randomUUID(),
            cohort_name: "high_value_users",
            user_count: 47,
            trigger: "cohort_entered",
            distinct_id: `user_${randomUUID().replace(/-/g, "").substring(0, 12)}`,
            properties: { plan: "pro", mrr_cents: 4999, signup_days_ago: 14 },
            web_url: `https://us.posthog.com/project/${projectId}/cohorts`,
          },
        },
        headers: { "Content-Type": "application/json", "X-PostHog-Webhook-Event": "cohort" },
      };
    }

    case "feature_flag_anomaly": {
      return {
        payload: {
          event: "feature_flag_anomaly",
          timestamp: now,
          project_id: projectId,
          payload: {
            flag_key: "checkout_redesign",
            control_conversion: 0.12,
            variant_conversion: 0.31,
            p_value: 0.003,
            samples: { control: 1200, variant: 1180 },
            recommendation: "promote_variant",
            web_url: `https://us.posthog.com/project/${projectId}/experiments`,
          },
        },
        headers: { "Content-Type": "application/json", "X-PostHog-Webhook-Event": "experiment" },
      };
    }

    case "retention_drop": {
      return {
        payload: {
          event: "retention_alert",
          timestamp: now,
          project_id: projectId,
          payload: {
            metric: "d7_retention",
            current: 0.22,
            baseline: 0.38,
            cohort_date: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
            cohort_size: 450,
            web_url: `https://us.posthog.com/project/${projectId}/retention`,
          },
        },
        headers: { "Content-Type": "application/json", "X-PostHog-Webhook-Event": "retention" },
      };
    }

    case "conversion_milestone": {
      return {
        payload: {
          event: "milestone_reached",
          timestamp: now,
          project_id: projectId,
          payload: {
            milestone: "1000_paid_signups",
            value: 1003,
            window: "all_time",
            web_url: `https://us.posthog.com/project/${projectId}/insights`,
          },
        },
        headers: { "Content-Type": "application/json", "X-PostHog-Webhook-Event": "milestone" },
      };
    }

    case "session_replay_alert": {
      return {
        payload: {
          event: "session_replay_alert",
          timestamp: now,
          project_id: projectId,
          payload: {
            alert_type: "rage_click_spike",
            rage_click_rate: 0.18,
            baseline: 0.04,
            sessions_analyzed: 520,
            top_element: "button.submit",
            web_url: `https://us.posthog.com/project/${projectId}/replay`,
          },
        },
        headers: { "Content-Type": "application/json", "X-PostHog-Webhook-Event": "replay" },
      };
    }

    default:
      throw new Error(`Unknown PostHog event type: ${eventType}`);
  }
}
