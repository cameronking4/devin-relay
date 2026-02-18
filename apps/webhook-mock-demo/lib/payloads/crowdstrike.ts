import { randomUUID } from "crypto";

/**
 * CrowdStrike Falcon Webhook payload format.
 * Triggers: New endpoint detection, Endpoint detection (status/comment), Workflow execution, Audit events.
 * Headers: x-cs-primary-signature, x-cs-delivery-timestamp, x-cs-signature-algorithm
 * @see https://marketplace.crowdstrike.com/listings/webhook
 * @see https://zenduty.com/docs/crowdstrike-integration/
 */
export function generateCrowdStrikePayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const detectionId = `ldt:${randomUUID().replace(/-/g, "")}`;
  const severity = Math.floor(Math.random() * 60) + 40; // 40-100

  const baseHeaders = {
    "Content-Type": "application/json",
    "x-cs-delivery-timestamp": String(Date.now()),
    "x-cs-signature-algorithm": "HMAC-SHA256",
    "x-cs-primary-signature": "placeholder",
  };

  switch (eventType) {
    case "detection.new": {
      return {
        payload: {
          metadata: {
            event_type: "DetectionSummaryEvent",
            customer_id: randomUUID(),
            offset: Math.floor(Math.random() * 100000),
            version: "1.0",
            event_creation_time: now,
          },
          event: {
            DetectionId: detectionId,
            Severity: severity,
            Status: "new",
            Hostname: "WORKSTATION-ENG-042",
            LocalIP: "10.0.1.42",
            MacAddress: "00:1a:2b:3c:4d:5e",
            SensorId: `lids:${randomUUID().slice(0, 16)}`,
            CommandLine: "powershell.exe -EncodedCommand ...",
            FileName: "suspicious_script.ps1",
            FilePath: "C:\\Users\\john\\Downloads\\",
            Tactic: "Execution",
            Technique: "PowerShell",
            Objective: "T1059.001",
            Timestamp: now,
            ProcessId: 4521,
            UserName: "john.doe",
          },
        },
        headers: baseHeaders,
      };
    }

    case "detection.status.changed": {
      const statuses = ["new", "in_progress", "true_positive", "false_positive", "closed"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      return {
        payload: {
          metadata: {
            event_type: "DetectionStatusChangedEvent",
            customer_id: randomUUID(),
            event_creation_time: now,
          },
          event: {
            DetectionId: detectionId,
            Severity: severity,
            Status: status,
            PreviousStatus: "new",
            AssignedTo: status !== "new" ? "analyst@acme.com" : null,
            Comment: status === "closed" ? "False positive - approved tool" : null,
            Timestamp: now,
          },
        },
        headers: baseHeaders,
      };
    }

    case "endpoint.new": {
      return {
        payload: {
          metadata: {
            event_type: "NewEndpointDetectedEvent",
            customer_id: randomUUID(),
            event_creation_time: now,
          },
          event: {
            Hostname: "SERVER-PROD-089",
            LocalIP: "10.0.2.89",
            MacAddress: "00:50:56:a1:b2:c3",
            SensorId: `lids:${randomUUID().slice(0, 16)}`,
            OsVersion: "Windows Server 2022",
            AgentVersion: "7.12.18203",
            FirstSeen: now,
            LastSeen: now,
            Domain: "acme.corp",
          },
        },
        headers: baseHeaders,
      };
    }

    case "incident.created": {
      return {
        payload: {
          metadata: {
            event_type: "IncidentCreatedEvent",
            customer_id: randomUUID(),
            event_creation_time: now,
          },
          event: {
            IncidentId: randomUUID(),
            IncidentName: "Multiple endpoint detections - possible ransomware",
            Severity: 80,
            Status: "new",
            DetectionIds: [detectionId, `ldt:${randomUUID().replace(/-/g, "")}`],
            Tactic: "Impact",
            Technique: "Data Encrypted for Impact",
            StartTime: now,
            AssignedTo: null,
          },
        },
        headers: baseHeaders,
      };
    }

    case "ioar.firing": {
      return {
        payload: {
          metadata: {
            event_type: "IOARuleFiringEvent",
            customer_id: randomUUID(),
            event_creation_time: now,
          },
          event: {
            RuleId: `ioar:${randomUUID().slice(0, 16)}`,
            RuleName: "Suspicious PowerShell Download",
            Severity: severity,
            Hostname: "WORKSTATION-SALES-012",
            CommandLine: "powershell -nop -w hidden -c ...",
            Tactic: "Command and Control",
            Technique: "Ingress Tool Transfer",
            Objective: "T1105",
            Timestamp: now,
          },
        },
        headers: baseHeaders,
      };
    }

    case "audit.policy.changed": {
      const actions = ["created", "modified", "deleted"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      return {
        payload: {
          metadata: {
            event_type: "PolicyAuditEvent",
            customer_id: randomUUID(),
            event_creation_time: now,
          },
          event: {
            PolicyDetail: {
              id: randomUUID(),
              name: "Prevention Policy - Production",
              description: "Block known malware and suspicious scripts",
              platform: "Windows",
              policy_type: "prevention",
            },
            Action: action,
            CreatedByEmail: "admin@acme.com",
            ModifiedByEmail: action !== "created" ? "admin@acme.com" : null,
            Timestamp: now,
          },
        },
        headers: baseHeaders,
      };
    }

    default:
      throw new Error(`Unknown CrowdStrike event type: ${eventType}`);
  }
}
