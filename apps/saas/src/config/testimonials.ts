/**
 * This file is used to store the testimonials for the homepage.
 * The testimonials are stored as an array of arrays of arrays.
 * Each array represents a column of testimonials.
 * Each inner array represents a row of testimonials.
 * Each testimonial is an object with a body and author property.
 *
 * @note add your testimonials evenly
 */

type Testimonial = {
    body: string;
    author: {
        name: string;
        handle: string;
        imageUrl: string;
        logoUrl?: string;
    };
};

export const featuredTestimonial: Testimonial = {
    body: "Had a webhook to Devin flow running in under 15 minutes. No custom glue code, no Zapier. Just connected GitHub, pasted a prompt template, and Devin started commenting on PRs. Exactly what we needed.",
    author: {
        name: "Brenna Goyette",
        handle: "brennagoyette",
        imageUrl:
            "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80",
        logoUrl: "https://tailwindui.com/img/logos/savvycal-logo-gray-900.svg",
    },
};

export const testimonials: Testimonial[][][] = [
    [
        [
            {
                body: "We were spending hours on webhook plumbing. Relay handles ingestion, signature validation, and Devin orchestration. Our platform team can finally focus on prompts instead of glue.",
                author: {
                    name: "Leslie Alexander",
                    handle: "lesliealexander",
                    imageUrl:
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            {
                body: "The execution dashboard gives us full visibility. Every payload, every rendered prompt, every Devin output. Trust through visibility is exactly right.",
                author: {
                    name: "Lindsay Walton",
                    handle: "lindsaywalton",
                    imageUrl:
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
        [
            {
                body: "The execution dashboard gives us full visibility. Every payload, every rendered prompt, every Devin output. Trust through visibility is exactly right.",
                author: {
                    name: "Lindsay Walton",
                    handle: "lindsaywalton",
                    imageUrl:
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
    ],
    [
        [
            {
                body: "BYOK for Devin was the right call. We control our AI keys, Relay handles the orchestration. No vendor lock-in on the AI side.",
                author: {
                    name: "Tom Cook",
                    handle: "tomcook",
                    imageUrl:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },

            // More testimonials...
        ],
        [
            {
                body: "Conditional workflows would be nice later, but for MVP this is perfect. GitHub PR → Devin → comment. Simple, auditable, no surprises.",
                author: {
                    name: "Leonard Krasner",
                    handle: "leonardkrasner",
                    imageUrl:
                        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            {
                body: "BYOK for Devin was the right call. We control our AI keys, Relay handles the orchestration. No vendor lock-in on the AI side.",
                author: {
                    name: "Tom Cook",
                    handle: "tomcook",
                    imageUrl:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
    ],
];
