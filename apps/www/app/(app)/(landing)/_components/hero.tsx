'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import * as m from 'motion/react-m'
import { TextEffect } from '@/components/ui/text-effect'
import LogoCarousel from '@/components/ui/logo-carousel'
import { logos } from '@/config/logos'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    Announcement,
    PageActions,
    PageDescription,
    PageHeader,
    PageHeading,
} from '@/app/(app)/_components/page-header'
import { urls } from '@/config/urls'

const h1Transition = {
    delay: 0,
    speedReveal: 0.9,
    speedSegment: 0.3,
}

const variants = {
    hidden: {
        opacity: 0,
        y: 20,
        filter: 'blur(15px)',
    },
    visible: (custom: { delay?: number; duration?: number }) => ({
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            delay: custom?.delay ?? 0,
            duration: custom?.duration ?? 0.6,
        },
    }),
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- React 19 + motion type compatibility
const PageDescriptionMotion = m.create(PageDescription as any)

export function Hero() {
    const isMobile = useIsMobile()

    return (
        <PageHeader as="div">
            <m.div
                variants={variants}
                initial="hidden"
                animate="visible"
                custom={{ delay: 0.5 }}
            >
                <Announcement
                    url={urls.app.relay.signup}
                    text="Connect a webhook and trigger Devin in 15 minutes"
                    actionText="Get Started"
                />
            </m.div>

            <PageHeading className="text-foreground/70">
                <TextEffect
                    as="span"
                    preset="fade-in-blur"
                    speedReveal={h1Transition.speedReveal}
                    speedSegment={h1Transition.speedSegment}
                    delay={h1Transition.delay}
                >
                    <span className="text-foreground">Event-Driven</span> AI{' '}
                    <span className="text-foreground">Orchestration</span> for{' '}
                    <span className="text-foreground">Engineering</span>{' '}
                    Signals{' '}
                </TextEffect>
            </PageHeading>
            <PageDescriptionMotion
                variants={variants}
                initial="hidden"
                animate="visible"
                custom={{ delay: 0.8 }}
            >
                <span className="text-foreground font-bold">Relay</span> converts{' '}
                <span className="text-foreground font-bold">webhook events</span>{' '}
                into structured{' '}
                <span className="text-foreground font-bold">Devin</span> sessions
                and routes outputs back into{' '}
                <span className="text-foreground font-bold">engineering systems</span>.
                No custom glue code required.
            </PageDescriptionMotion>
            <PageActions>
                <m.div
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    custom={{ delay: 1 }}
                >
                    <Link
                        href={urls.app.relay.signup}
                        className={cn(
                            buttonVariants({
                                size: 'xl',
                                variant: 'defaultWithOutline',
                                className: 'rounded-full before:rounded-full',
                            })
                        )}
                    >
                        Get Started —{' '}
                        <span className="font-normal italic">
                            no code required
                        </span>
                    </Link>
                </m.div>
                <m.div
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    custom={{ delay: 1.1 }}
                >
                    <Link
                        href={urls.app.pricing}
                        className={cn(
                            buttonVariants({
                                variant: 'secondaryWithOutline',
                                className: 'rounded-full before:rounded-full',
                                size: 'xl',
                            })
                        )}
                    >
                        View Pricing
                    </Link>
                </m.div>
            </PageActions>

            {!isMobile ? <FloatingLogos /> : null}
        </PageHeader>
    )
}

function FloatingLogos() {
    const logoPositions = [
        { x: 'left-0', y: 'top-0', duration: 8000, delay: 0 },
        {
            x: '-left-30',
            y: 'top-1/3 -translate-y-1/3',
            duration: 12000,
            delay: 2000,
        },
        { x: 'left-0', y: 'bottom-0', duration: 10500, delay: 4000 },
        { x: 'right-0', y: 'top-0', duration: 9500, delay: 1000 },
        {
            x: '-right-30',
            y: 'top-1/3 -translate-y-1/3',
            duration: 11000,
            delay: 3000,
        },
        { x: 'right-0', y: 'bottom-0', duration: 13000, delay: 5000 },
    ]

    const logosPerPosition = Math.floor(logos.length / logoPositions.length)
    const remainingLogos = logos.length % logoPositions.length

    const positionsWithLogos = logoPositions.map((position, index) => {
        const startIndex =
            index * logosPerPosition + Math.min(index, remainingLogos)
        const endIndex =
            startIndex + logosPerPosition + (index < remainingLogos ? 1 : 0)
        const positionLogos = logos.slice(startIndex, endIndex)

        return {
            ...position,
            logos: positionLogos,
            index,
        }
    })

    return (
        <>
            {positionsWithLogos.map((position, index) => (
                <m.div
                    variants={variants}
                    initial="hidden"
                    animate="visible"
                    custom={{
                        delay: 1 + 0.2 * index,
                    }}
                    key={position.index}
                    className={`absolute ${position.x} ${position.y}`}
                >
                    <m.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 2, -2, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4 + Math.random() * 4, // Random duration between 4-8 seconds
                            ease: 'easeInOut',
                            times: [0, 0.5, 1],
                            delay: Math.random() * 2, // Random delay up to 2 seconds
                        }}
                    >
                        <LogoCarousel
                            columnCount={1}
                            logos={position.logos}
                            cycleInterval={position.duration}
                            initialDelay={position.delay}
                        />
                    </m.div>
                </m.div>
            ))}
        </>
    )
}
