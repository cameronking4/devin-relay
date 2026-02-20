import Features from "@/app/(web)/_components/features";
import {
    WebPageHeader,
    WebPageWrapper,
} from "@/app/(web)/_components/general-components";
import { Promotion } from "@/app/(web)/_components/promotion";
import { Testimonials } from "@/app/(web)/_components/testimonials";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Relay — Event-Driven AI Orchestration for Engineering Signals",
};

export const dynamic = "force-static";

export default async function HomePage() {
    return (
        <WebPageWrapper>
            <WebPageHeader
                badge="Unlock Event-Based Devin Triggers"
                title="Instantly act on production signals with managed webhooks for Devin"
            >
                <Balancer
                    as="p"
                    className="text-center text-base text-muted-foreground sm:text-lg max-w-4xl"
                >
                    Relay converts webhook events into structured Devin sessions and routes outputs back into engineering systems.
                </Balancer>

                <div className="flex items-center gap-3">
                    <Link
                        href={siteUrls.github}
                        className={buttonVariants({ variant: "outline" })}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icons.gitHub className="mr-2 h-4 w-4" />View Source on Github
                    </Link>

                    <Link
                        href={siteUrls.auth.signup}
                        className={buttonVariants()}
                    >
                        Get Started
                        <span className="ml-1 font-light italic">
                            — no code or card required
                        </span>
                    </Link>
                </div>
            </WebPageHeader>

            <div className="-m-2 w-full rounded-xl bg-foreground/5 p-2 ring-1 ring-inset ring-foreground/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="relative aspect-video w-full rounded-md bg-muted">
                    <Image
                        src="/Relay-Dashboard.png"
                        alt="dashboard preview"
                        fill
                        className="block rounded-md border border-border dark:hidden"
                        priority
                    />

                    <Image
                        src="/Relay-Dashboard.png"
                        alt="dashboard preview"
                        fill
                        className="hidden rounded-md border border-border dark:block"
                        priority
                    />
                </div>
            </div>

            <Promotion />

            <Features />

            <Testimonials />
        </WebPageWrapper>
    );
}
