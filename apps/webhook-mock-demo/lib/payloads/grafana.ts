import { randomUUID } from "crypto";

export function generateGrafanaPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const state = eventType === "alerting" || eventType === "alerting_multi" ? "firing" : "resolved";
  const isMulti = eventType === "alerting_multi";
  const now = new Date().toISOString();

  const baseAlert = {
    status: state,
    labels: {
      alertname: "High memory usage",
      team: "platform",
      zone: "us-east-1",
    },
    annotations: {
      description: "The system has high memory usage",
      runbook_url: "https://runbooks.example.com/high-memory",
      summary: "Memory usage above 85% for zone us-east-1",
    },
    startsAt: state === "firing" ? now : new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endsAt: state === "resolved" ? now : "0001-01-01T00:00:00Z",
    generatorURL: "https://grafana.example.com/alerting/1afz29v7z/edit",
    fingerprint: randomUUID().replace(/-/g, "").slice(0, 16),
    silenceURL:
      "https://grafana.example.com/alerting/silence/new?matchers=alertname%3DHigh%20memory%20usage%2Cteam%3Dplatform",
    dashboardURL: "https://grafana.example.com/d/abc123/monitoring",
    panelURL: "https://grafana.example.com/d/abc123/monitoring?viewPanel=2",
    values: { B: 87.2, C: 1 },
  };

  const cpuAlert = {
    ...baseAlert,
    labels: {
      alertname: "High CPU usage",
      team: "platform",
      zone: "eu-west-1",
    },
    annotations: {
      description: "The system has high CPU usage",
      runbook_url: "https://runbooks.example.com/high-cpu",
      summary: "CPU usage above 80% for zone eu-west-1",
    },
    fingerprint: randomUUID().replace(/-/g, "").slice(0, 16),
  };

  const alerts = isMulti ? [baseAlert, cpuAlert] : [baseAlert];

  const payload = {
    receiver: "Relay Webhook",
    status: state,
    orgId: 1,
    alerts,
    groupLabels: isMulti ? { team: "platform" } : {},
    commonLabels: isMulti ? { team: "platform" } : { alertname: baseAlert.labels.alertname, team: baseAlert.labels.team },
    commonAnnotations: isMulti ? {} : { runbook_url: baseAlert.annotations.runbook_url },
    externalURL: "https://grafana.example.com/",
    version: "1",
    groupKey: isMulti ? "{}:{team=\"platform\"}" : "{}:{}",
    truncatedAlerts: 0,
    title: isMulti ? `[FIRING:2] (platform)` : `[${state.toUpperCase()}:1] High memory usage`,
    state: state === "firing" ? "alerting" : "ok",
    message: isMulti
      ? `**Firing**\n\nLabels:\n - alertname = High memory usage\n - team = platform\n - zone = us-east-1\n\nLabels:\n - alertname = High CPU usage\n - team = platform\n - zone = eu-west-1`
      : state === "firing"
        ? "**Firing**\n\nLabels:\n - alertname = High memory usage\n - team = platform\n - zone = us-east-1\nSource: https://grafana.example.com/alerting/1afz29v7z/edit"
        : "**Resolved**\n\nLabels:\n - alertname = High memory usage\n - team = platform",
  };

  return {
    payload,
    headers: {},
  };
}
