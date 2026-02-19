/**
 * Dynatrace problem notification webhook payload.
 * @see https://docs.dynatrace.com/docs/analyze-explore-automate/notifications-and-alerting/problem-notifications/webhook-integration
 */

export function generateDynatracePayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const problemId = `-${Math.floor(Math.random() * 999999999)}`;
  const pid = String(Math.floor(Math.random() * 99999));

  const isResolved = eventType === "problem_resolved";
  const state = isResolved ? "RESOLVED" : "OPEN";
  const impact =
    eventType === "problem_infrastructure"
      ? "INFRASTRUCTURE"
      : eventType === "problem_service"
        ? "SERVICE"
        : "APPLICATION";

  const impactedEntities = [
    { type: "HOST", name: "prod-web-01", entity: "HOST-XXXXXXXXXXXXX" },
    { type: "SERVICE", name: "api-gateway", entity: "SERVICE-XXXXXXXXXXXXX" },
  ];

  const problemTitle = isResolved
    ? "High response time on api-gateway - resolved"
    : eventType === "problem_merged"
      ? "High response time on api-gateway - new events merged"
      : eventType === "problem_infrastructure"
        ? "CPU spike on prod-web-01"
        : eventType === "problem_service"
          ? "Error rate increased on api-gateway"
          : "High response time on api-gateway";

  const problemDetailsHtml = `<h1>Dynatrace problem notification</h1><p>Problem ${problemId}: ${problemTitle}</p><p>State: ${state}</p>`;

  const problemDetailsJson = {
    ID: pid,
    State: state,
    Impact: impact,
    RootCause: eventType === "problem_merged" ? "New root cause detected" : undefined,
  };

  const payload = {
    ImpactedEntities: impactedEntities,
    ImpactedEntity: "prod-web-01, api-gateway",
    PID: pid,
    ProblemDetailsHTML: problemDetailsHtml,
    ProblemDetailsJSON: problemDetailsJson,
    ProblemID: problemId,
    ProblemImpact: impact,
    ProblemTitle: problemTitle,
    "Problem URL": `https://example.live.dynatrace.com/#problems/problemdetails;pid=${pid}`,
    State: state,
    Tags: "production, us-east-1, api",
  };

  return {
    payload,
    headers: {},
  };
}
