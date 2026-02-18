import { randomUUID } from "crypto";

export function generatePrometheusPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const alertName = eventType === "firing" ? "HighCPUUsage" : "HighCPUUsageResolved";
  const status = eventType === "firing" ? "firing" : "resolved";

  const payload = {
    version: "4",
    groupKey: `{}:{alertname="${alertName}"}`,
    truncatedAlerts: 0,
    status,
    receiver: "webhook-relay",
    groupLabels: {
      alertname: alertName,
    },
    commonLabels: {
      alertname: alertName,
      severity: "critical",
      instance: "server-01",
      job: "node-exporter",
    },
    commonAnnotations: {
      summary: "High CPU usage detected",
      description: "CPU usage is above 80% for more than 5 minutes",
    },
    externalURL: "http://alertmanager:9093",
    alerts: [
      {
        status,
        labels: {
          alertname: alertName,
          severity: "critical",
          instance: "server-01",
          job: "node-exporter",
        },
        annotations: {
          summary: "High CPU usage detected",
          description: "CPU usage is above 80% for more than 5 minutes",
        },
        startsAt: eventType === "firing" ? now : new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        endsAt: eventType === "resolved" ? now : null,
        generatorURL: `http://prometheus:9090/graph?g0.expr=up%7Bjob%3D%22node-exporter%22%7D&g0.tab=1`,
        fingerprint: randomUUID().replace(/-/g, ""),
      },
    ],
  };

  return {
    payload,
    headers: {},
  };
}
