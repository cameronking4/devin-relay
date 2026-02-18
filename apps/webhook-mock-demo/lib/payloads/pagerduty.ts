import { randomUUID } from "crypto";

export function generatePagerDutyPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const incidentId = randomUUID();
  const incidentNumber = Math.floor(Math.random() * 100000);
  const serviceId = randomUUID();
  const now = new Date().toISOString();

  const baseIncident = {
    id: incidentId,
    incident_number: incidentNumber,
    type: "incident",
    summary: "High CPU Usage Alert",
    self: `https://api.pagerduty.com/incidents/${incidentId}`,
    html_url: `https://example.pagerduty.com/incidents/${incidentId}`,
    created_at: now,
    status: eventType === "incident_triggered" ? "triggered" : eventType === "incident_acknowledged" ? "acknowledged" : "resolved",
    incident_key: `high-cpu-${incidentNumber}`,
    service: {
      id: serviceId,
      type: "service",
      summary: "API Service",
      self: `https://api.pagerduty.com/services/${serviceId}`,
      html_url: `https://example.pagerduty.com/services/${serviceId}`,
    },
    assignments: [],
    acknowledgers: [],
    last_status_change_at: now,
    last_status_change_by: {
      id: randomUUID(),
      type: "user_reference",
    },
    first_trigger_log_entry: {
      id: randomUUID(),
      type: "trigger_log_entry",
    },
    escalation_policy: {
      id: randomUUID(),
      type: "escalation_policy_reference",
      summary: "Default Escalation Policy",
    },
    teams: [],
    priority: {
      id: randomUUID(),
      type: "priority_reference",
      summary: "P1",
      name: "Critical",
    },
    urgency: "high",
    resolve_reason: eventType === "incident_resolved" ? {
      type: "resolve_reason",
      reason: "automated",
      note: "Alert condition cleared",
    } : null,
  };

  switch (eventType) {
    case "incident_triggered": {
      return {
        payload: {
          event: "incident.triggered",
          created_at: now,
          incident: baseIncident,
          trigger_summary_data: {
            subject: "High CPU Usage Alert",
            description: "CPU usage is above 80%",
          },
        },
        headers: {},
      };
    }

    case "incident_acknowledged": {
      return {
        payload: {
          event: "incident.acknowledged",
          created_at: now,
          incident: {
            ...baseIncident,
            status: "acknowledged",
            acknowledgers: [
              {
                at: now,
                acknowledger: {
                  id: randomUUID(),
                  type: "user_reference",
                  summary: "John Doe",
                },
              },
            ],
          },
        },
        headers: {},
      };
    }

    case "incident_resolved": {
      return {
        payload: {
          event: "incident.resolved",
          created_at: now,
          incident: {
            ...baseIncident,
            status: "resolved",
            resolve_reason: {
              type: "resolve_reason",
              reason: "automated",
              note: "Alert condition cleared",
            },
          },
        },
        headers: {},
      };
    }

    case "incident_escalated": {
      return {
        payload: {
          event: "incident.escalated",
          created_at: now,
          incident: {
            ...baseIncident,
            status: "triggered",
            incident_key: `high-cpu-${incidentNumber}`,
            escalation_level: 2,
            escalations: [
              {
                at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                escalation_policy: {
                  id: baseIncident.escalation_policy.id,
                  type: "escalation_policy_reference",
                  summary: "Default Escalation Policy",
                  html_url: "https://example.pagerduty.com/escalation_policies/xyz",
                },
              },
            ],
            trigger_summary_data: {
              subject: "High CPU Usage Alert - Escalated",
              description: "No acknowledgment within 15 minutes. Escalated to L2 on-call.",
            },
          },
        },
        headers: {},
      };
    }

    default:
      throw new Error(`Unknown PagerDuty event type: ${eventType}`);
  }
}
