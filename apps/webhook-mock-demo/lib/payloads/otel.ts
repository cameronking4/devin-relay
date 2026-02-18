import { randomUUID } from "crypto";

export function generateOtelPayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const now = new Date().toISOString();
  const traceId = randomUUID().replace(/-/g, "");
  const spanId = randomUUID().replace(/-/g, "").substring(0, 16);

  switch (eventType) {
    case "trace_slow": {
      return {
        payload: {
          event: "trace_alert",
          alert_type: "slow_trace",
          timestamp: now,
          trace_id: traceId,
          span_id: spanId,
          service_name: "checkout-api",
          duration_ms: 8400,
          threshold_ms: 3000,
          span_count: 23,
          root_span: "POST /api/checkout",
          web_url: `https://otel.example.com/traces/${traceId}`,
        },
        headers: { "Content-Type": "application/json", "X-OTel-Event": "trace_alert" },
      };
    }

    case "span_error_rate": {
      return {
        payload: {
          event: "trace_alert",
          alert_type: "span_error_rate_spike",
          timestamp: now,
          service_name: "payment-gateway",
          span_name: "charge.card",
          error_rate: 0.18,
          baseline: 0.02,
          sample_count: 450,
          window_minutes: 5,
          top_errors: ["card_declined", "timeout"],
          web_url: "https://otel.example.com/services/payment-gateway",
        },
        headers: { "Content-Type": "application/json", "X-OTel-Event": "trace_alert" },
      };
    }

    case "dependency_degraded": {
      return {
        payload: {
          event: "trace_alert",
          alert_type: "dependency_degraded",
          timestamp: now,
          service_name: "api-gateway",
          dependency_service: "auth-service",
          dependency_type: "http",
          latency_p99_ms: 3200,
          baseline_p99_ms: 120,
          error_rate: 0.12,
          window_minutes: 10,
          web_url: "https://otel.example.com/services/api-gateway/dependencies",
        },
        headers: { "Content-Type": "application/json", "X-OTel-Event": "trace_alert" },
      };
    }

    case "resource_exhaustion": {
      return {
        payload: {
          event: "metrics_alert",
          alert_type: "resource_exhaustion",
          timestamp: now,
          service_name: "worker-pool",
          resource: "memory",
          current_pct: 92,
          threshold_pct: 85,
          container_id: `cnt_${randomUUID().replace(/-/g, "").substring(0, 12)}`,
          window_minutes: 5,
          web_url: "https://otel.example.com/metrics",
        },
        headers: { "Content-Type": "application/json", "X-OTel-Event": "metrics_alert" },
      };
    }

    default:
      throw new Error(`Unknown OpenTelemetry event type: ${eventType}`);
  }
}
