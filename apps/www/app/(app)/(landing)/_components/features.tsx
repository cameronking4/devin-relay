'use client'

import {
    SectionContent,
    SectionDescription,
    SectionHeader,
    SectionHeading,
} from '@/app/(app)/_components/section-header'
import { buttonVariants } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { urls } from '@/config/urls'
import { cn } from '@/lib/utils'
import { ExternalLinkIcon } from 'lucide-react'
import * as m from 'motion/react-m'
import Link from 'next/link'

interface FeatureCardProps {
    title: string
    description: string
    features: string[]
    linkHref: string
    linkText: string
    heroText: string
}

const MotionCard = m.create(Card)

function FeatureCard({
    title,
    description,
    features,
    linkHref,
    linkText,
    heroText,
}: FeatureCardProps) {
    return (
        <MotionCard
            whileInView={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
            }}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="grid w-full grid-cols-1 overflow-hidden py-0 md:grid-cols-2 lg:grid-cols-3"
        >
            <div className="grain-effect mesh-background relative flex h-full min-h-36 w-full items-center justify-center p-4">
                <div className="z-20 text-center text-2xl leading-snug font-bold text-balance text-white md:text-4xl">
                    {heroText}
                </div>
            </div>
            <div className="py-6 lg:col-span-2">
                <CardHeader>
                    <CardTitle as="h3">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="my-6">
                    <ul className="list-disc space-y-2 pl-6">
                        {features.map((feature, index) => (
                            <li key={index} className="text-sm font-medium">
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Link
                        href={linkHref}
                        className={cn(
                            buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                            })
                        )}
                    >
                        {linkText}
                        <ExternalLinkIcon />
                    </Link>
                </CardFooter>
            </div>
        </MotionCard>
    )
}

export function Features() {
    const eventSourcesFeatures = [
        'GitHub: pull_request.opened, pull_request.synchronize, issue_comment.created.',
        'Generic webhook: JSON POST, unique endpoint per trigger, optional HMAC validation.',
        'Schema introspection: Flattened field paths, click-to-insert variables.',
    ]

    const triggerConfigFeatures = [
        'Mustache-style template interpolation with variable picker UI.',
        'Test render with sample payload, version history, dry-run mode.',
        'BYOK Devin API key, encrypted at rest, never logged.',
    ]

    const executionFeatures = [
        'Execution list: event source, status, latency, timestamp.',
        'Detail view: raw payload, rendered prompt, Devin output, errors, retry info.',
        'Concurrency limits, daily caps, kill switch, idempotency.',
    ]

    const featureCards = [
        {
            title: 'Event Sources',
            description:
                'Native GitHub integration and generic JSON webhooks. No custom endpoints to host—Relay provides unique URLs per trigger with optional HMAC validation and schema introspection.',
            features: eventSourcesFeatures,
            linkHref: urls.app.relay.dashboard,
            linkText: 'View Relay',
            heroText: 'Event Sources',
        },
        {
            title: 'Trigger Configuration',
            description:
                'Define event source, filters, and prompt templates. Mustache-style variables with test render, dry-run mode, and version history. BYOK Devin integration.',
            features: triggerConfigFeatures,
            linkHref: urls.app.relay.dashboard,
            linkText: 'View Relay',
            heroText: 'Trigger Config',
        },
        {
            title: 'Execution Visibility',
            description:
                'Full audit trail for every run. Raw payload, rendered prompt, Devin output, latency, and errors. Trust through visibility with concurrency and daily caps.',
            features: executionFeatures,
            linkHref: urls.app.relay.dashboard,
            linkText: 'View Relay',
            heroText: 'Execution Dashboard',
        },
    ]

    return (
        <SectionHeader>
            <SectionHeading>What Relay offers.</SectionHeading>
            <SectionDescription>
                Event → Context Binding → Prompt Rendering → Devin Session →
                Structured Action.
            </SectionDescription>

            <SectionContent className="gap-14">
                {featureCards.map((card, index) => (
                    <FeatureCard key={index} {...card} />
                ))}
            </SectionContent>
        </SectionHeader>
    )
}
