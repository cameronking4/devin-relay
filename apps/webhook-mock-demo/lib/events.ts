export type Event = {
  id: string;
  name: string;
  desc: string;
  emoji?: string;
};

export type ServiceEvents = {
  [service: string]: Event[];
};

export const EVENTS: ServiceEvents = {
  sentry: [
    { id: "issue_alert", name: "Issue Alert Triggered", desc: "Error threshold exceeded - alert rule triggered", emoji: "🚨" },
    { id: "metric_alert", name: "Metric Alert (Critical/Warning/Resolved)", desc: "Metric alert state change", emoji: "📊" },
    { id: "issue_created", name: "Issue Created", desc: "New issue created in project", emoji: "🐛" },
    { id: "issue_resolved", name: "Issue Resolved", desc: "Issue marked as resolved", emoji: "✅" },
    { id: "issue_assigned", name: "Issue Assigned", desc: "Issue assigned to a team member", emoji: "👤" },
  ],
  vercel: [
    { id: "deployment_created", name: "Deployment Created", desc: "New deployment started", emoji: "🚀" },
    { id: "deployment_ready", name: "Deployment Ready", desc: "Deployment succeeded and is ready", emoji: "✨" },
    { id: "deployment_error", name: "Deployment Error", desc: "Build or deployment failed", emoji: "❌" },
    { id: "deployment_canceled", name: "Deployment Canceled", desc: "Deployment was canceled", emoji: "⏸️" },
    { id: "alert_error_anomaly", name: "Error Anomaly", desc: "5xx error rate spike (Pro/Enterprise)", emoji: "📈" },
    { id: "alert_usage_anomaly", name: "Usage Anomaly", desc: "Traffic spike above baseline", emoji: "🔥" },
  ],
  prometheus: [
    { id: "firing", name: "Alert Firing", desc: "Alert is firing (active)", emoji: "⚠️" },
    { id: "resolved", name: "Alert Resolved", desc: "Alert condition resolved", emoji: "🟢" },
    { id: "firing_multi", name: "Multiple Alerts Firing", desc: "Several alerts firing at once", emoji: "🔴" },
  ],
  datadog: [
    { id: "monitor_alert", name: "Monitor Alert - Triggered", desc: "Monitor threshold exceeded", emoji: "🔔" },
    { id: "monitor_recovery", name: "Monitor Recovery", desc: "Monitor condition recovered", emoji: "💚" },
    { id: "monitor_no_data", name: "Monitor No Data", desc: "Monitor stopped reporting data", emoji: "📵" },
    { id: "monitor_warning", name: "Monitor Warning", desc: "Monitor in warning state", emoji: "🟡" },
  ],
  grafana: [
    { id: "alerting", name: "Alert Firing", desc: "Grafana alert is firing", emoji: "⚠️" },
    { id: "ok", name: "Alert OK", desc: "Grafana alert condition cleared", emoji: "✓" },
    { id: "alerting_multi", name: "Multiple Alerts Firing", desc: "Several Grafana alerts firing", emoji: "🔴" },
  ],
  pagerduty: [
    { id: "incident_triggered", name: "Incident Triggered", desc: "New incident created", emoji: "🚨" },
    { id: "incident_acknowledged", name: "Incident Acknowledged", desc: "Incident acknowledged by responder", emoji: "👍" },
    { id: "incident_resolved", name: "Incident Resolved", desc: "Incident resolved", emoji: "✅" },
    { id: "incident_escalated", name: "Incident Escalated", desc: "Incident escalated to next level", emoji: "⬆️" },
  ],
  github: [
    { id: "push", name: "Push", desc: "Commits pushed to branch", emoji: "📤" },
    { id: "pull_request", name: "Pull Request", desc: "PR opened, closed, or synchronized", emoji: "🔀" },
    { id: "workflow_run", name: "Workflow Run", desc: "GitHub Actions workflow completed", emoji: "⚙️" },
    { id: "deployment_status", name: "Deployment Status", desc: "Deployment status update", emoji: "🚀" },
    { id: "release", name: "Release Published", desc: "New release published", emoji: "🎉" },
    { id: "issue", name: "Issue Opened", desc: "New issue opened in repo", emoji: "📋" },
  ],
  vanta: [
    { id: "control.status.changed", name: "Control Status Changed", desc: "Compliance control passed or failed in continuous monitoring", emoji: "📋" },
    { id: "policy.violation", name: "Policy Violation", desc: "Security or access policy no longer met", emoji: "⚠️" },
    { id: "risk.finding", name: "Risk Finding", desc: "New or escalated risk identified", emoji: "🔴" },
    { id: "employee.onboarded", name: "Employee Onboarded", desc: "New employee added - trigger access provisioning", emoji: "👤" },
    { id: "employee.offboarded", name: "Employee Offboarded", desc: "Employee offboarded - trigger access revocation", emoji: "🚪" },
    { id: "integration.drift", name: "Integration Drift", desc: "Evidence or integration data mismatch detected", emoji: "🔗" },
  ],
  crowdstrike: [
    { id: "detection.new", name: "New Detection", desc: "Endpoint detection triggered - malware or suspicious activity", emoji: "🛡️" },
    { id: "detection.status.changed", name: "Detection Status Changed", desc: "Detection acknowledged, resolved, or escalated", emoji: "🔄" },
    { id: "endpoint.new", name: "New Endpoint Detected", desc: "New host/endpoint seen in environment", emoji: "💻" },
    { id: "incident.created", name: "Incident Created", desc: "Security incident created from detection(s)", emoji: "🚨" },
    { id: "ioar.firing", name: "IOA Rule Firing", desc: "Indicators of Attack rule triggered", emoji: "📡" },
    { id: "audit.policy.changed", name: "Policy Audit Event", desc: "Policy created, modified, or deleted", emoji: "📜" },
  ],
  linear: [
    { id: "issue_create", name: "Issue Created", desc: "New Linear issue created", emoji: "📝" },
    { id: "issue_update", name: "Issue Updated", desc: "Issue status or fields changed", emoji: "🔄" },
    { id: "comment_create", name: "Comment Created", desc: "New comment on issue", emoji: "💬" },
  ],
  posthog: [
    { id: "cohort_entered", name: "Cohort Entered", desc: "User entered a target cohort (e.g. high-value)", emoji: "🎯" },
    { id: "feature_flag_anomaly", name: "Feature Flag Anomaly", desc: "Unusual conversion diff between flag variants", emoji: "🚩" },
    { id: "retention_drop", name: "Retention Drop", desc: "D7 retention dropped below baseline", emoji: "📉" },
    { id: "conversion_milestone", name: "Conversion Milestone", desc: "Signup or upgrade milestone reached", emoji: "🏆" },
    { id: "session_replay_alert", name: "Session Replay Alert", desc: "High rage-click or error rate in replays", emoji: "🎬" },
  ],
  logflare: [
    { id: "error_spike", name: "Error Log Spike", desc: "Error count exceeded threshold in time window", emoji: "📛" },
    { id: "latency_p99", name: "P99 Latency Breach", desc: "P99 request latency exceeded SLA", emoji: "🐢" },
    { id: "pattern_detected", name: "Log Pattern Detected", desc: "Correlation pattern found (e.g. repeated stack trace)", emoji: "🔍" },
    { id: "audit_anomaly", name: "Audit Log Anomaly", desc: "Unusual admin/auth activity pattern", emoji: "🔐" },
  ],
  otel: [
    { id: "trace_slow", name: "Slow Trace Detected", desc: "Trace duration exceeded threshold", emoji: "🐌" },
    { id: "span_error_rate", name: "Span Error Rate Spike", desc: "Error rate increased for service/span", emoji: "⚠️" },
    { id: "dependency_degraded", name: "Dependency Degraded", desc: "Downstream service latency/errors increased", emoji: "🔗" },
    { id: "resource_exhaustion", name: "Resource Exhaustion", desc: "CPU/memory metrics near limit", emoji: "💾" },
  ],
  azure_monitor: [
    { id: "metric_alert", name: "Metric Alert Fired", desc: "Metric threshold exceeded (e.g. CPU, memory)", emoji: "📊" },
    { id: "log_alert", name: "Log Analytics Alert", desc: "KQL query condition met in Log Analytics", emoji: "📜" },
    { id: "activity_log", name: "Activity Log Event", desc: "Resource create/delete/scale in subscription", emoji: "📋" },
    { id: "availability_test", name: "Availability Test Failed", desc: "Application Insights availability check failed", emoji: "🔴" },
    { id: "smart_detection", name: "Smart Detection Alert", desc: "Anomaly detected (failure rate, response time)", emoji: "🧠" },
  ],
  azure_devops: [
    { id: "build.complete", name: "Build Completed", desc: "Pipeline build finished (succeeded or failed)", emoji: "🏗️" },
    { id: "git.push", name: "Code Pushed", desc: "Commits pushed to a branch", emoji: "📤" },
    { id: "git.pullrequest.created", name: "Pull Request Created", desc: "New PR opened", emoji: "🔀" },
    { id: "git.pullrequest.updated", name: "Pull Request Updated", desc: "PR status, review, or source changed", emoji: "🔄" },
    { id: "workitem.created", name: "Work Item Created", desc: "New work item (task, bug, etc.)", emoji: "📋" },
    { id: "workitem.updated", name: "Work Item Updated", desc: "Work item state or fields changed", emoji: "✏️" },
  ],
  typeform: [
    { id: "form_response", name: "Form Response Submitted", desc: "New form submission with answers", emoji: "📝" },
  ],
  cloudwatch: [
    { id: "alarm_state", name: "Alarm State Change", desc: "Alarm entered ALARM, OK, or INSUFFICIENT_DATA", emoji: "🔔" },
    { id: "log_metric_filter", name: "Log Metric Filter Triggered", desc: "CloudWatch Logs filter matched pattern", emoji: "📝" },
    { id: "anomaly_detection", name: "Anomaly Detection Alert", desc: "Metric anomaly detected (ML-based)", emoji: "📈" },
    { id: "composite_alarm", name: "Composite Alarm Fired", desc: "Multiple alarms combined condition met", emoji: "🔶" },
    { id: "insights_alarm", name: "Contributor Insights Alarm", desc: "Unusual contributor to metric (e.g. top error source)", emoji: "🔍" },
  ],
};

export const SERVICES = Object.keys(EVENTS) as string[];
