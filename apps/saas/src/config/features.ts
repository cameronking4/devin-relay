/**
 * This file contains the features data for the features page.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and inludedIn to the new feature object. (inludedIn is an array of pricing plan ids that include this feature)
 * 3. Add description to the new feature object.
 * 4. Add image to the new feature object.
 * 5. Add imageDark to the new feature object. (optional)
 */

export type Feature = {
    title: string;
    description: string;
    image: string;
    imageDark?: string;
};

export const features: Feature[] = [
    {
        title: "Event Sources",
        description:
            "Connect GitHub, Sentry, Prometheus, PagerDuty, and Vercel events and more through webhooks. Each trigger gets a unique endpoint with optional HMAC validation. No custom glue code—just point webhooks at Relay and go.",
        image: "/Relay-Signals.png",
        imageDark: "/Relay-Signals.png",
    },
    {
        title: "Webhook Ingestion",
        description:
            "Signature validation, idempotency via delivery ID, and raw payload storage. Events are enqueued async—responds in under 2 seconds. Never blocks on AI calls inside the request lifecycle.",
        image: "/Relay-Settings.png",
        imageDark: "/Relay-Settings.png",
    },
    {
        title: "Trigger Configuration",
        description:
            "Configure event source, event type, repository filter, and prompt template. Mustache-style interpolation with variable picker UI. Concurrency limits and daily caps keep automation under control.",
        image: "/Relay-Trigger.png",
        imageDark: "/Relay-Trigger.png",
    },
    {
        title: "Devin Integration & Output Routing",
        description:
            "BYOK Devin API key, encrypted at rest. Renders your prompt, creates a Devin session, polls until completion, and posts the output to GitHub PR comments. Trust through visibility—every execution is logged.",
        image: "/Relay-Prompt.png",
        imageDark: "/Relay-Prompt.png",
    },
];
