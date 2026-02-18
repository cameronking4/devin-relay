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
            "Connect GitHub PR events and generic JSON webhooks. Each trigger gets a unique endpoint with optional HMAC validation. No custom glue code—just point webhooks at Relay and go.",
        image: "https://utfs.io/f/43bbc3c8-cf3c-4fae-a0eb-9183f1779489-294m81.png",
        imageDark:
            "https://utfs.io/f/fddea366-51c6-45f4-bd54-84d273ad9fb9-1ly324.png",
    },
    {
        title: "Webhook Ingestion",
        description:
            "Signature validation, idempotency via delivery ID, and raw payload storage. Events are enqueued async—responds in under 2 seconds. Never blocks on AI calls inside the request lifecycle.",
        image: "https://utfs.io/f/805616c1-22b8-4508-9890-9ba9e2867a41-p24dnn.png",
        imageDark:
            "https://utfs.io/f/9074c0de-d9ea-4c0b-9d49-55dca1253a3f-6ig3yq.png",
    },
    {
        title: "Trigger Configuration",
        description:
            "Configure event source, event type, repository filter, and prompt template. Mustache-style interpolation with variable picker UI. Concurrency limits and daily caps keep automation under control.",
        image: "https://utfs.io/f/43bbc3c8-cf3c-4fae-a0eb-9183f1779489-294m81.png",
        imageDark:
            "https://utfs.io/f/fddea366-51c6-45f4-bd54-84d273ad9fb9-1ly324.png",
    },
    {
        title: "Devin Integration & Output Routing",
        description:
            "BYOK Devin API key, encrypted at rest. Renders your prompt, creates a Devin session, polls until completion, and posts the output to GitHub PR comments. Trust through visibility—every execution is logged.",
        image: "https://utfs.io/f/72a2c035-69e0-46ca-84a8-446e4dabf77c-3koi6e.png",
        imageDark:
            "https://utfs.io/f/89099112-4273-4375-9e44-1b3394600e21-c6ikq1.png",
    },
];
