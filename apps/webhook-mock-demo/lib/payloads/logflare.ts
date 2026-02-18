export function generateLogflarePayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  switch (eventType) {
    case "error_spike": {
      return {
        payload: {
          result: [
            { error_count: 847, threshold: 100, window_minutes: 5, severity: "high", top_message: "Connection refused: db.example.com:5432" },
          ],
        },
        headers: { "Content-Type": "application/json", "X-Logflare-Event": "query_alert" },
      };
    }

    case "latency_p99": {
      return {
        payload: {
          result: [{ p99_latency_ms: 4200, threshold_ms: 2000, endpoint: "/api/checkout", sample_count: 1200 }],
        },
        headers: { "Content-Type": "application/json", "X-Logflare-Event": "query_alert" },
      };
    }

    case "pattern_detected": {
      return {
        payload: {
          result: [{ pattern: "TypeError: Cannot read property '.*' of undefined", occurrences: 45, sample_file: "auth.middleware.js:87" }],
        },
        headers: { "Content-Type": "application/json", "X-Logflare-Event": "query_alert" },
      };
    }

    case "audit_anomaly": {
      return {
        payload: {
          result: [{ anomaly_type: "unusual_admin_activity", event_count: 12, actors: "user_abc123" }],
        },
        headers: { "Content-Type": "application/json", "X-Logflare-Event": "query_alert" },
      };
    }

    default:
      throw new Error(`Unknown Logflare event type: ${eventType}`);
  }
}
