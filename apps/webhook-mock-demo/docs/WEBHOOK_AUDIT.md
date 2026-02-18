# Webhook Mock Data Audit

## Executive Summary

| Service | Has Webhooks? | Payload Accuracy | Notes |
|---------|---------------|------------------|-------|
| Sentry | ✅ Yes | Good | Structure matches; simplified event payload |
| Vercel | ✅ Yes | Good | Matches deployment/alert event format |
| Prometheus | ✅ Yes | **Accurate** | Matches Alertmanager v4 webhook spec |
| Datadog | ✅ Yes | Fair | Uses custom payload; structure is plausible |
| Grafana | ✅ Yes | Fair | Custom payload; our format is generic |
| PagerDuty | ✅ Yes | Good | V2 webhook structure |
| GitHub | ✅ Yes | **Accurate** | Matches documented payload shapes |
| Vanta | ✅ Yes (via Svix) | **Accurate** | Svix envelope (id, type, timestamp, data); control, policy, risk, employee, integration events |
| CrowdStrike Falcon | ✅ Yes | **Accurate** | Detection, endpoint, incident, IOA, audit event structure |
| Linear | ✅ Yes | Good | Webhooks for create/update |
| PostHog | ✅ Yes | Mixed | Sends raw events; our "cohort/retention" = **fictional** |
| Logflare | ✅ Yes | Off | Real: `{ "result": [...] }` query results; ours = invented |
| OpenTelemetry | ❌ **No** | N/A | OTel = protocol, not webhooks; **entirely fictional** |
| Azure Monitor | ✅ Yes | Needs fix | Should use Common Alert Schema |
| CloudWatch | ✅ Yes (via EventBridge) | Good | Matches EventBridge alarm payload |
| Azure DevOps | ✅ Yes (Service Hooks) | **Accurate** | eventType, resource, resourceContainers per [docs](https://learn.microsoft.com/en-us/azure/devops/service-hooks/events) |
| Typeform | ✅ Yes | **Accurate** | form_response with event_id, form_response, definition, answers per [docs](https://www.typeform.com/developers/webhooks/example-payload/) |

---

### Convex (no outbound webhooks)

**Convex** does **not** provide outbound webhooks. Convex receives webhooks from external services (Clerk, Stripe, etc.) via HTTP actions. There is no built-in mechanism to POST to an external URL when database data changes. Do not add Convex to webhook mocks.

---

## Detailed Findings

### ✅ Services with Accurate/Good Mocks

**Prometheus** – Alertmanager sends HTTP POST with JSON. Our payload matches the [official spec](https://prometheus.io/docs/alerting/latest/configuration/): `version`, `groupKey`, `status`, `alerts[]`, `commonLabels`, `commonAnnotations`, `externalURL`. ✓

**GitHub** – Webhook payloads follow [docs](https://docs.github.com/en/webhooks/webhook-events-and-payloads). Our push, pull_request, workflow_run, etc. match structure (ref, repository, commits, action, etc.). ✓

**Vanta** – Uses Svix webhook delivery. Payload: `id`, `type`, `timestamp`, `data`. Headers: `svix-id`, `svix-timestamp`, `svix-signature`. Events: control.status.changed, policy.violation, risk.finding, employee.onboarded/offboarded, integration.drift. ✓

**CrowdStrike Falcon** – Webhook events: New detection, Endpoint detection (status/comment), Workflow execution, Audit (policy changes). Payloads use `metadata`, `event` with `DetectionId`, `Severity`, `Hostname`, etc. Headers: `x-cs-primary-signature`, `x-cs-delivery-timestamp`, `x-cs-signature-algorithm`. ✓

**Azure DevOps** – Service Hooks send `eventType`, `resource`, `resourceVersion`, `resourceContainers`, `createdDate`, `message`, `detailedMessage`. Events: build.complete, git.push, git.pullrequest.created/updated, workitem.created/updated. Resource shapes match Build, Git Push, Pull Request, and Work Item REST APIs. ✓

**Typeform** – Single event `form_response`. Payload: `event_id`, `event_type`, `form_response` with `form_id`, `token`, `submitted_at`, `landed_at`, `definition`, `answers`, `ending`. Header: `Typeform-Signature` (sha256=base64 HMAC). ✓

---

### ⚠️ Services Requiring Fixes or Clarification

**PostHog** – PostHog webhooks send raw events (e.g. `$capture`, `$identify`). They do **not** send "Cohort Entered", "Retention Drop", "Feature Flag Anomaly" as first-class webhook events. Those would be computed elsewhere. Our payloads are conceptual, not from PostHog.

**Logflare** – Query Alerts send `{ "result": [ { "docs_total_hits": 1 }, ... ] }` — the SQL query result. Our payloads (error_spike, latency_p99, pattern_detected, audit_anomaly) use an invented alert format. Should be `{ "result": [...] }` for accuracy.

**OpenTelemetry** – OTel is a protocol/spec for traces, metrics, logs. It does **not** expose webhooks. Observability tools (Honeycomb, Grafana, etc.) that ingest OTel may have webhooks, but there is no standard "OTel webhook". Our service is fictional. Recommendation: rename to "Observability Platform" or remove.

**Azure Monitor** – Current payloads use `AzureMonitorMetricAlert` and custom structures. Azure recommends the [Common Alert Schema](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema) with `schemaId: "azureMonitorCommonAlertSchema"` and `data.essentials` / `data.alertContext`. Our format is partially correct for some alert types but should align with the common schema for consistency.

---

## Recommendations

1. **Remove or relabel fictional events**: PostHog cohort/retention, OpenTelemetry. (PostHog/OTel = conceptual.)
2. ~~**Fix Azure Monitor**~~: ✅ Done – now uses Common Alert Schema.
3. ~~**Fix Logflare**~~: ✅ Done – now uses `{ "result": [...] }` Query Alert format.
4. **OpenTelemetry**: OTel has no webhooks. Consider renaming to "Honeycomb" (has webhooks) or "Observability Platform" as a generic demo.
