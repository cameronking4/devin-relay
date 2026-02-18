import { randomUUID } from "crypto";

export function generateGrafanaPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const state = eventType === "alerting" ? "alerting" : "ok";
  const alertId = randomUUID();
  const dashboardId = Math.floor(Math.random() * 1000);
  const panelId = Math.floor(Math.random() * 100);

  const payload = {
    title: state === "alerting" ? "[Alerting] High CPU Usage" : "[OK] High CPU Usage",
    state,
    message: state === "alerting" 
      ? "CPU usage is above 80%"
      : "CPU usage has returned to normal",
    ruleId: 1,
    ruleName: "High CPU Usage",
    ruleUrl: `http://grafana:3000/alerting/list`,
    stateChanges: {
      previousState: state === "alerting" ? "ok" : "alerting",
      newState: state,
    },
    imageUrl: `http://grafana:3000/render/d-solo/${dashboardId}/dashboard?panelId=${panelId}`,
    evalMatches: [
      {
        value: state === "alerting" ? 85 : 45,
        metric: "cpu_usage",
        tags: {
          instance: "server-01",
          job: "node-exporter",
        },
      },
    ],
    dashboardId,
    panelId,
    orgId: 1,
    tags: {
      environment: "production",
      service: "api",
    },
    alerts: [
      {
        labels: {
          alertname: "High CPU Usage",
          severity: "critical",
          instance: "server-01",
        },
        annotations: {
          summary: "High CPU usage detected",
          description: "CPU usage is above 80%",
        },
        state: state === "alerting" ? "alerting" : "ok",
        activeAt: new Date().toISOString(),
        value: state === "alerting" ? "85" : "45",
      },
    ],
  };

  return {
    payload,
    headers: {},
  };
}
