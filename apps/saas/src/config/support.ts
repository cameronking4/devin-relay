/**
 * @purpose Contains the support information for the support section.
 * The supportInfo array contains the support information for the support section.
 * Each object in the array contains the following properties:
 * - title: The title for the support information.
 * - description: The description for the support information.
 * - email: (Optional) The email address for the support information.
 * - buttonHref: The URL for the button.
 * - buttonText: The text for the button.
 *
 * After it will be used in the support section of the landing page. @see (websiteUrl)/support
 * You can modify support UI by modifying this file. @see /app/(web)/support/page.tsx
 */

import { siteUrls } from "@/config/urls";

export type SupportInfo = {
    title: string;
    description: string;
    email?: string;
    buttonHref: string;
    buttonText: string;
};

export const supportInfos: SupportInfo[] = [
    {
        title: "General",
        description:
            "Questions about Relay, webhook setup, or event-driven AI automation.",
        email: "hello@example.com",
        buttonHref: `mailto:hello@example.com`,
        buttonText: "Get in touch",
    },
    {
        title: "Tech Support",
        description:
            "Devin integration, GitHub routing, or execution issues. Our team will help you debug.",
        email: "tech@example.com",
        buttonHref: `mailto:tech@example.com`,
        buttonText: "Get in touch",
    },
    {
        title: "Enterprise",
        description:
            "For teams needing higher volume, custom integrations, or dedicated support.",
        email: "sales@example.com",
        buttonHref: `mailto:sales@example.com`,
        buttonText: "Contact sales",
    },
    {
        title: "Blog",
        description:
            "Read about Relay, engineering signals, and event-driven AI orchestration.",
        buttonHref: `${siteUrls.blogs}`,
        buttonText: "Read Blog",
    },
];
