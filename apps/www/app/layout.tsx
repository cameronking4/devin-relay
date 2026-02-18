import type { Metadata } from 'next'
import '../styles/globals.css'
import { fontsVariables } from '@/lib/fonts'
import { Providers } from '@/components/providers/providers'
import { siteConfig } from '@/config/site'
import { Toaster } from '@/components/ui/sonner'
import { urls } from '@/config/urls'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
    title: `${siteConfig.noSpacesName} — Event-Driven AI Orchestration for Engineering Signals`,
    description:
        'Relay converts webhook events into structured Devin sessions and routes outputs back into engineering systems. Connect a webhook and trigger Devin within 15 minutes without writing code.',
    metadataBase: new URL(urls.public),
    keywords: [
        'Relay', // Brand
        'Event-Driven AI', // Primary Offering
        'AI Orchestration', // Core Capability
        'Webhook to Devin', // Key Flow
        'Engineering Signals', // Target Use Case
        'GitHub Integration', // Native Integration
        'Devin', // AI Provider
        'Platform Engineering', // Target ICP
        'DevEx', // Target ICP
        'Next.js', // Core Technology
        'TypeScript', // Core Technology
        'PostgreSQL', // Backend
        'Redis', // Queue Layer
    ],
    authors: [
        {
            name: 'alifarooq',
            url: urls.socials.ali,
        },
    ],
    creator: 'alifarooq',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: urls.public,
        title: siteConfig.name,
        description:
            'Relay converts webhook events into structured Devin sessions and routes outputs back into engineering systems. Connect a webhook and trigger Devin within 15 minutes without writing code.',
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImages.base,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description:
            'Relay converts webhook events into structured Devin sessions and routes outputs back into engineering systems. Connect a webhook and trigger Devin within 15 minutes without writing code.',
        images: [siteConfig.ogImages.base],
        creator: '@AliFarooqDev',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: `${urls.public}/site.webmanifest`,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${fontsVariables} font-sans antialiased`}>
                <div className="relative flex min-h-svh flex-col overflow-x-hidden">
                    <Providers>{children}</Providers>
                </div>

                <Toaster />

                <Analytics />
            </body>
        </html>
    )
}
