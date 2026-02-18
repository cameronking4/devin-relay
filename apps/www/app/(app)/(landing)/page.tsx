import { Features } from '@/app/(app)/(landing)/_components/features'
import { Hero } from '@/app/(app)/(landing)/_components/hero'
import { Demos } from '@/app/(app)/(landing)/_components/demos'
import { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { CallToAction } from '@/app/(app)/(landing)/_components/cta'
import { Benefits } from '@/app/(app)/(landing)/_components/benefits'
import { PageContainer } from '@/app/(app)/_components/page-header'

export const metadata: Metadata = {
    title: `${siteConfig.name} — Event-Driven AI Orchestration for Engineering Signals`,
    description:
        'Relay converts webhook events into structured Devin sessions and routes outputs back into engineering systems. Connect a webhook and trigger Devin within 15 minutes without writing code.',
}

export default function MarketingPage() {
    return (
        <PageContainer>
            <section className="flex w-full flex-col gap-16">
                <Hero />

                <Demos />
            </section>

            <Features />

            <Benefits />

            <CallToAction />
        </PageContainer>
    )
}
