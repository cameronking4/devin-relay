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

  if (eventType === "monitor_no_data") {
    return {
      payload: {
        "@alert": {
          id: alertId,
          title: "No Data - API Response Time",
          text: "Monitor has not received data for 5 minutes",
          date_happened: Math.floor(Date.now() / 1000),
          priority: "normal",
          source_type_name: "monitor",
          alert_type: "no_data",
          aggregated_key: `monitor:${monitorId}`,
          tags: ["env:production", "service:api"],
        },
        "@title": "No Data - API Response Time",
        "@message": "Monitor has not received data for 5 minutes",
        alert_type: "no_data",
        alert_transition: "No Data",
        date: Math.floor(Date.now() / 1000),
        event_type: "monitor",
        id: alertId,
        monitor_id: monitorId,
        monitor_name: "API Response Time",
        monitor_priority: 2,
        msg_title: "No Data - API Response Time",
        msg_text: "Monitor has not received data for 5 minutes",
        org: { id: 12345, name: "example-org" },
        priority: "normal",
        tags: ["env:production", "service:api"],
        text: "Monitor has not received data for 5 minutes",
        title: "No Data - API Response Time",
        url: `https://app.datadoghq.com/monitors/${monitorId}`,
      },
      headers: {},
    };
  }

  if (eventType === "monitor_warning") {
    return {
      payload: {
        "@alert": {
          id: alertId,
          title: "Warning - High Error Rate",
          text: "Error rate above 5% threshold",
          date_happened: Math.floor(Date.now() / 1000),
          priority: "normal",
          source_type_name: "monitor",
          alert_type: "warning",
          aggregated_key: `monitor:${monitorId}`,
          tags: ["env:production", "service:api"],
        },
        "@title": "Warning - High Error Rate",
        "@message": "Error rate above 5% threshold (current: 7.2%)",
        alert_type: "warning",
        alert_transition: "Warning",
        date: Math.floor(Date.now() / 1000),
        event_type: "monitor",
        id: alertId,
        monitor_id: monitorId,
        monitor_name: "High Error Rate",
        monitor_priority: 2,
        msg_title: "Warning - High Error Rate",
        msg_text: "Error rate above 5% threshold (current: 7.2%)",
        org: { id: 12345, name: "example-org" },
        priority: "normal",
        tags: ["env:production", "service:api"],
        text: "Error rate above 5% threshold (current: 7.2%)",
        title: "Warning - High Error Rate",
        url: `https://app.datadoghq.com/monitors/${monitorId}`,
      },
      headers: {},
    };
  }

  throw new Error(`Unknown Datadog event type: ${eventType}`);
}
