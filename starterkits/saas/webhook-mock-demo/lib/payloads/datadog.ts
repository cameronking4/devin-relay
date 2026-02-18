import { randomUUID } from "crypto";

export function generateDatadogPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const alertId = randomUUID();
  const monitorId = Math.floor(Math.random() * 1000000);

  if (eventType === "monitor_alert") {
    return {
      payload: {
        "@alert": {
          id: alertId,
          title: "High CPU Usage Alert",
          text: "CPU usage is above 80%",
          date_happened: Math.floor(Date.now() / 1000),
          priority: "normal",
          source_type_name: "monitor",
          alert_type: "error",
          aggregated_key: `monitor:${monitorId}`,
          tags: ["env:production", "service:api"],
        },
        "@title": "High CPU Usage Alert",
        "@message": "CPU usage is above 80%",
        alert_type: "error",
        alert_transition: "Triggered",
        date: Math.floor(Date.now() / 1000),
        event_type: "monitor",
        id: alertId,
        monitor_id: monitorId,
        monitor_name: "High CPU Usage",
        monitor_priority: 1,
        msg_title: "High CPU Usage Alert",
        msg_text: "CPU usage is above 80%",
        org: {
          id: 12345,
          name: "example-org",
        },
        priority: "normal",
        tags: ["env:production", "service:api"],
        text: "CPU usage is above 80%",
        title: "High CPU Usage Alert",
        url: `https://app.datadoghq.com/monitors/${monitorId}`,
      },
      headers: {},
    };
  }

  if (eventType === "monitor_recovery") {
    return {
      payload: {
        "@alert": {
          id: alertId,
          title: "High CPU Usage Alert - Recovered",
          text: "CPU usage has returned to normal",
          date_happened: Math.floor(Date.now() / 1000),
          priority: "normal",
          source_type_name: "monitor",
          alert_type: "recovery",
          aggregated_key: `monitor:${monitorId}`,
          tags: ["env:production", "service:api"],
        },
        "@title": "High CPU Usage Alert - Recovered",
        "@message": "CPU usage has returned to normal",
        alert_type: "recovery",
        alert_transition: "Recovered",
        date: Math.floor(Date.now() / 1000),
        event_type: "monitor",
        id: alertId,
        monitor_id: monitorId,
        monitor_name: "High CPU Usage",
        monitor_priority: 1,
        msg_title: "High CPU Usage Alert - Recovered",
        msg_text: "CPU usage has returned to normal",
        org: {
          id: 12345,
          name: "example-org",
        },
        priority: "normal",
        tags: ["env:production", "service:api"],
        text: "CPU usage has returned to normal",
        title: "High CPU Usage Alert - Recovered",
        url: `https://app.datadoghq.com/monitors/${monitorId}`,
      },
      headers: {},
    };
  }

  throw new Error(`Unknown Datadog event type: ${eventType}`);
}
