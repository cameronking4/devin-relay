/**
 * This file contains the pricing data for the pricing page.
 *
 * @add a new pricing plan, add a new object to the `pricing` array.
 * 1. Add id to the pricingIds object then use it as the id of the new pricing object.
 * 2. Add badge(optional), title, description, price, currency, duration, highlight, popular, and uniqueFeatures(optional) to the new pricing object.
 * 3. if the new pricing plan has unique features, add a new object to the `uniqueFeatures` array.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and inludedIn to the new feature object. (inludedIn is an array of pricing plan ids that include this feature)
 */

export type PrincingPlan = {
    id: string;
    badge?: string;
    title: string;
    description: string;
    price: {
        monthly: number;
        yearly: number;
    };
    currency: {
        code: string;
        symbol: string;
    };
    duration: string;
    highlight: string;
    buttonHighlighted: boolean;
    uniqueFeatures?: string[];
    variantId?: {
        monthly: number;
        yearly: number;
    };
};

export type PricingFeature = {
    id: string;
    title: string;
    inludedIn: string[];
};

export const pricingIds = {
    free: "free",
    pro: "pro",
    premium: "premium",
} as const;

export const pricingFeatures: PricingFeature[] = [
    {
        id: "1",
        title: "GitHub integration (pull_request, issue_comment)",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "2",
        title: "Generic JSON webhooks with HMAC validation",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "3",
        title: "Mustache prompt templates with variable picker",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "4",
        title: "Execution dashboard (visibility, latency, errors)",
        inludedIn: [pricingIds.free, pricingIds.pro, pricingIds.premium],
    },
    {
        id: "5",
        title: "Schema introspection for custom webhooks",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "7",
        title: "Higher concurrency limit (default 1 → 10)",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "8",
        title: "Higher daily execution cap (default 50 → 200)",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "9",
        title: "Dry-run mode for prompt testing",
        inludedIn: [pricingIds.pro, pricingIds.premium],
    },
    {
        id: "10",
        title: "Up to 100 executions per day",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "11",
        title: "Priority execution queue",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "12",
        title: "Extended session timeout (10 min → 30 min)",
        inludedIn: [pricingIds.premium],
    },
    {
        id: "13",
        title: "Schema version history",
        inludedIn: [pricingIds.premium],
    },
];

export const pricingPlans: PrincingPlan[] = [
    {
        id: pricingIds.free,
        title: "Starter",
        description:
            "1 project, 3 triggers. Connect a webhook and trigger Devin in 15 minutes. No code required.",
        price: {
            monthly: 0,
            yearly: 0,
        },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "Forever",
        highlight:
            "No credit card required. Default 3 concurrent sessions, 50 executions/day cap.",
        buttonHighlighted: false,
        uniqueFeatures: ["1 project, 3 triggers, 50 executions/day"],
    },
    {
        id: pricingIds.pro,
        badge: "Most Popular",
        title: "Pro",
        description:
            "For platform and DevEx teams scaling event-driven AI automation.",
        price: {
            monthly: 99,
            yearly: 999,
        },
        variantId: { monthly: 362869, yearly: 362870 },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight:
            "Higher concurrency, schema introspection, dry-run mode. For AI-forward startups (10–200 engineers).",
        buttonHighlighted: true,
        uniqueFeatures: ["5 projects, 15 triggers, 200 executions/day"],
    },
    {
        id: pricingIds.premium,
        title: "Team",
        description:
            "For teams with higher volume and extended session timeouts.",
        price: {
            monthly: 199,
            yearly: 1999,
        },
        variantId: { monthly: 362872, yearly: 362874 },
        currency: {
            code: "USD",
            symbol: "$",
        },
        duration: "per month",
        highlight:
            "Priority queue, 30 min timeout, schema version history.",
        buttonHighlighted: false,
        uniqueFeatures: ["Unlimited projects, 50 triggers, 500 executions/day"],
    },
];
