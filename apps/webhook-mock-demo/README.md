# Webhook Mock Demo

A Next.js application for testing Relay webhooks by mocking production monitoring services (Sentry, Vercel, Prometheus, Datadog, Grafana, PagerDuty).

## Features

- **Webhook URL Input**: Paste your Relay webhook URL (supports localhost, ngrok, or production URLs)
- **Service Selection**: Choose from Sentry, Vercel, Prometheus, Datadog, Grafana, or PagerDuty
- **Event Testing**: Send mock events manually with accurate payload formats
- **Response Log**: View HTTP status codes and response bodies for each webhook call
- **Accurate Payloads**: Uses Context7 documentation to generate realistic webhook payloads

## Setup

1. Install dependencies:
```bash
cd webhook-mock-demo
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The app will run on `http://localhost:3001` (different port from the main SaaS app).

## Usage

1. **Start your Relay/SaaS app** (if testing locally):
```bash
cd ../starterkits/saas
pnpm dev  # Runs on port 3000
```

2. **Get your webhook URL**:
   - Navigate to your Relay project in the SaaS app
   - Create or view a trigger
   - Copy the webhook URL (e.g., `http://localhost:3000/api/webhook/custom/ab289814-79ef-4e85-8c88-94ba939e0935`)

3. **Open the mock demo**: `http://localhost:3001`

4. **Paste your webhook URL** in the input field at the top

5. **Select a service** from the dropdown (e.g., Sentry, Vercel)

6. **Click Send** on any event to trigger it

7. **View responses** in the Response Log panel on the right

## Supported Services & Events

### Sentry
- **Issue Alert Triggered**: Error threshold exceeded
- **Metric Alert**: Critical/warning/resolved metric alerts
- **Issue Created**: New issue created in project

### Vercel
- **Deployment Created**: New deployment started
- **Deployment Ready**: Deployment succeeded
- **Deployment Error**: Build or deployment failed

### Prometheus
- **Alert Firing**: Alert is active
- **Alert Resolved**: Alert condition cleared

### Datadog
- **Monitor Alert**: Monitor threshold exceeded
- **Monitor Recovery**: Monitor condition recovered

### Grafana
- **Alert Firing**: Grafana alert is firing
- **Alert OK**: Grafana alert condition cleared

### PagerDuty
- **Incident Triggered**: New incident created
- **Incident Acknowledged**: Incident acknowledged by responder
- **Incident Resolved**: Incident resolved

## Payload Accuracy

All payloads are generated based on official documentation from:
- Sentry: [sentry-docs](https://github.com/getsentry/sentry-docs)
- Vercel: [Vercel Webhooks API](https://vercel.com/docs/webhooks)
- Prometheus: [Alertmanager](https://github.com/prometheus/alertmanager)
- Datadog, Grafana, PagerDuty: Official webhook documentation

## Testing Event Workflows (multi-trigger)

Relay supports **event workflows** that combine events from multiple triggers. To test:

1. **Create two triggers** in your Relay project (e.g. one for Sentry, one for Vercel). Copy each trigger’s webhook URL.
2. **Create an event workflow**: In the project’s Triggers page, click **Create workflow**. Name it (e.g. “Sentry + Vercel failure”), select both triggers, set **Match when** to **All**, and set **Time window** to 5 minutes. Save the workflow.
3. **Send events from the mock demo**: Paste the **first** webhook URL, select Sentry, and send an event (e.g. “Issue Alert Triggered”). Then paste the **second** webhook URL, select Vercel, and send “Deployment Error” (or any event). Do this within the same 5-minute window.
4. **Check Executions**: In Relay, open **Executions**. You should see one execution with **Origin: Workflow: &lt;your workflow name&gt;**, combining both events in the prompt.

Workflows use the same payload paths as triggers for conditions. The prompt receives `{{payload.summary}}` and `{{payload.sources}}` (events grouped by trigger name).

## Testing Relay Conditions

Use these payload paths for condition matching in Relay triggers:

- **Sentry**: `payload.data.event.message`, `payload.action`
- **Vercel**: `payload.type`, `payload.payload.deployment.state`
- **Prometheus**: `payload.status`, `payload.alerts.0.labels.severity`
- **Datadog**: `payload.@alert`, `payload.alert_type`
- **Grafana**: `payload.state`
- **PagerDuty**: `payload.event`

## Webhook URL Storage

The webhook URL is automatically saved to `localStorage` for convenience. It will be restored when you reload the page.

## Development

- Built with Next.js 14 (App Router)
- UI components from shadcn/ui
- TypeScript for type safety
- Tailwind CSS for styling
