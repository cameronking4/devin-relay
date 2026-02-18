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
    { id: "issue_alert", name: "Issue Alert Triggered", desc: "Error threshold exceeded - alert rule triggered" },
    { id: "metric_alert", name: "Metric Alert (Critical/Warning/Resolved)", desc: "Metric alert state change" },
    { id: "issue_created", name: "Issue Created", desc: "New issue created in project" },
    { id: "issue_resolved", name: "Issue Resolved", desc: "Issue marked as resolved" },
    { id: "issue_assigned", name: "Issue Assigned", desc: "Issue assigned to a team member" },
  ],
  vercel: [
    { id: "deployment_created", name: "Deployment Created", desc: "New deployment started" },
    { id: "deployment_ready", name: "Deployment Ready", desc: "Deployment succeeded and is ready" },
    { id: "deployment_error", name: "Deployment Error", desc: "Build or deployment failed" },
    { id: "deployment_canceled", name: "Deployment Canceled", desc: "Deployment was canceled" },
    { id: "alert_error_anomaly", name: "Observability: Error Anomaly", desc: "5xx error rate spike (Pro/Enterprise)" },
    { id: "alert_usage_anomaly", name: "Observability: Usage Anomaly", desc: "Traffic spike above baseline (Pro/Enterprise)" },
  ],
  prometheus: [
    { id: "firing", name: "Alert Firing", desc: "Alert is firing (active)" },
    { id: "resolved", name: "Alert Resolved", desc: "Alert condition resolved" },
    { id: "firing_multi", name: "Multiple Alerts Firing", desc: "Several alerts firing at once" },
  ],
  datadog: [
    { id: "monitor_alert", name: "Monitor Alert - Triggered", desc: "Monitor threshold exceeded" },
    { id: "monitor_recovery", name: "Monitor Recovery", desc: "Monitor condition recovered" },
    { id: "monitor_no_data", name: "Monitor No Data", desc: "Monitor stopped reporting data" },
    { id: "monitor_warning", name: "Monitor Warning", desc: "Monitor in warning state" },
  ],
  grafana: [
    { id: "alerting", name: "Alert Firing", desc: "Grafana alert is firing" },
    { id: "ok", name: "Alert OK", desc: "Grafana alert condition cleared" },
    { id: "alerting_multi", name: "Multiple Alerts Firing", desc: "Several Grafana alerts firing" },
  ],
  pagerduty: [
    { id: "incident_triggered", name: "Incident Triggered", desc: "New incident created" },
    { id: "incident_acknowledged", name: "Incident Acknowledged", desc: "Incident acknowledged by responder" },
    { id: "incident_resolved", name: "Incident Resolved", desc: "Incident resolved" },
    { id: "incident_escalated", name: "Incident Escalated", desc: "Incident escalated to next level" },
  ],
  github: [
    { id: "push", name: "Push", desc: "Commits pushed to branch" },
    { id: "pull_request", name: "Pull Request", desc: "PR opened, closed, or synchronized" },
    { id: "workflow_run", name: "Workflow Run", desc: "GitHub Actions workflow completed" },
    { id: "deployment_status", name: "Deployment Status", desc: "Deployment status update" },
    { id: "release", name: "Release Published", desc: "New release published" },
    { id: "issue", name: "Issue Opened", desc: "New issue opened in repo" },
  ],
  stripe: [
    { id: "payment_intent_succeeded", name: "Payment Intent Succeeded", desc: "One-time payment completed" },
    { id: "invoice_paid", name: "Invoice Paid", desc: "Subscription invoice paid" },
    { id: "customer_subscription_created", name: "Subscription Created", desc: "New subscription started" },
    { id: "customer_subscription_deleted", name: "Subscription Canceled", desc: "Subscription ended" },
    { id: "charge_failed", name: "Charge Failed", desc: "Payment attempt failed" },
  ],
  supabase: [
    { id: "db_insert", name: "Database INSERT", desc: "New row inserted" },
    { id: "db_update", name: "Database UPDATE", desc: "Row updated" },
    { id: "db_delete", name: "Database DELETE", desc: "Row deleted" },
  ],
  linear: [
    { id: "issue_create", name: "Issue Created", desc: "New Linear issue created" },
    { id: "issue_update", name: "Issue Updated", desc: "Issue status or fields changed" },
    { id: "comment_create", name: "Comment Created", desc: "New comment on issue" },
  ],
};

export const SERVICES = Object.keys(EVENTS) as string[];
