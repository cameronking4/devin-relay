import { randomUUID } from "crypto";

/**
 * Vanta webhooks use Svix. Payload format:
 * - id, type, timestamp, data
 * Headers: svix-id, svix-timestamp, svix-signature
 * @see https://developer.vanta.com/docs/webhooks
 */
export function generateVantaPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const msgId = `msg_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const basePayload = {
    id: msgId,
    type: eventType,
    timestamp,
    data: {} as Record<string, unknown>,
  };

  switch (eventType) {
    case "control.status.changed": {
      const status = Math.random() > 0.5 ? "passed" : "failed";
      basePayload.data = {
        control_id: randomUUID(),
        control_name: "MFA for Admin Access",
        framework: "SOC 2",
        previous_status: status === "passed" ? "failed" : "passed",
        current_status: status,
        failed_evidence_count: status === "failed" ? 2 : 0,
        last_evaluated_at: new Date().toISOString(),
      };
      break;
    }

    case "policy.violation": {
      basePayload.data = {
        violation_id: randomUUID(),
        policy_name: "Offboard within 24 hours",
        policy_type: "access",
        violated_at: new Date().toISOString(),
        affected_resources: [{ type: "user", id: `usr_${randomUUID().slice(0, 14)}`, name: "former.employee@acme.com" }],
        severity: "high",
      };
      break;
    }

    case "risk.finding": {
      basePayload.data = {
        finding_id: randomUUID(),
        risk_type: "unpatched_critical_vulnerability",
        title: "Critical vulnerability CVE-2024-1234 unpatched",
        severity: "critical",
        affected_assets: 3,
        first_seen: new Date(Date.now() - 86400000).toISOString(),
        status: "open",
        remediation: "Apply security patch within 7 days",
      };
      break;
    }

    case "employee.onboarded": {
      basePayload.data = {
        employee_id: randomUUID(),
        email: "new.hire@acme.com",
        name: "New Hire",
        department: "Engineering",
        started_at: new Date().toISOString(),
        role: "Software Engineer",
        manager_email: "manager@acme.com",
      };
      break;
    }

    case "employee.offboarded": {
      basePayload.data = {
        employee_id: randomUUID(),
        email: "departed@acme.com",
        name: "Departed User",
        last_day: new Date().toISOString().slice(0, 10),
        offboarded_at: new Date().toISOString(),
        reason: "resignation",
      };
      break;
    }

    case "integration.drift": {
      basePayload.data = {
        drift_id: randomUUID(),
        integration_name: "GitHub",
        drift_type: "evidence_mismatch",
        control_id: randomUUID(),
        description: "Admin users in GitHub exceed expected count",
        expected_value: "≤ 5",
        actual_value: "8",
        detected_at: new Date().toISOString(),
      };
      break;
    }

    default:
      throw new Error(`Unknown Vanta event type: ${eventType}`);
  }

  return {
    payload: basePayload,
    headers: {
      "Content-Type": "application/json",
      "svix-id": msgId,
      "svix-timestamp": String(timestamp),
      "svix-signature": "v1,placeholder-signature",
    },
  };
}
