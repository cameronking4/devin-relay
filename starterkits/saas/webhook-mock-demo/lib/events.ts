export type Event = {
  id: string;
  name: string;
  desc: string;
};

export type ServiceEvents = {
  [service: string]: Event[];
};

export const EVENTS: ServiceEvents = {
  sentry: [
    {
      id: "issue_alert",
      name: "Issue Alert Triggered",
      desc: "Error threshold exceeded - alert rule triggered",
    },
    {
      id: "metric_alert",
      name: "Metric Alert",
      desc: "Metric alert (critical / warning / resolved)",
    },
    {
      id: "issue_created",
      name: "Issue Created",
      desc: "New issue created in project",
    },
  ],
  vercel: [
    {
      id: "deployment_created",
      name: "Deployment Created",
      desc: "New deployment started",
    },
    {
      id: "deployment_ready",
      name: "Deployment Ready",
      desc: "Deployment succeeded and is ready",
    },
    {
      id: "deployment_error",
      name: "Deployment Error",
      desc: "Build or deployment failed",
    },
  ],
  prometheus: [
    {
      id: "firing",
      name: "Alert Firing",
      desc: "Alert is firing (active)",
    },
    {
      id: "resolved",
      name: "Alert Resolved",
      desc: "Alert condition resolved",
    },
  ],
  datadog: [
    {
      id: "monitor_alert",
      name: "Monitor Alert",
      desc: "Monitor threshold exceeded",
    },
    {
      id: "monitor_recovery",
      name: "Monitor Recovery",
      desc: "Monitor condition recovered",
    },
  ],
  grafana: [
    {
      id: "alerting",
      name: "Alert Firing",
      desc: "Grafana alert is firing",
    },
    {
      id: "ok",
      name: "Alert OK",
      desc: "Grafana alert condition cleared",
    },
  ],
  pagerduty: [
    {
      id: "incident_triggered",
      name: "Incident Triggered",
      desc: "New incident created",
    },
    {
      id: "incident_acknowledged",
      name: "Incident Acknowledged",
      desc: "Incident acknowledged by responder",
    },
    {
      id: "incident_resolved",
      name: "Incident Resolved",
      desc: "Incident resolved",
    },
  ],
};

export const SERVICES = Object.keys(EVENTS) as Array<keyof typeof EVENTS>;
