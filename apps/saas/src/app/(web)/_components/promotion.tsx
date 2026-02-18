import Balancer from "react-wrap-balancer";

export function Promotion() {
    return (
        <section className="flex min-h-96 w-full flex-col items-center justify-center gap-5 rounded-[26px] bg-foreground p-8 py-10 text-background">
            <Balancer
                as="h2"
                className="text-center font-heading text-3xl font-bold md:text-5xl"
            >
                Connect a webhook. Trigger Devin. Post to GitHub. 🚀
            </Balancer>
            <Balancer
                as="p"
                className="text-center text-base leading-relaxed text-background/70 sm:text-xl"
            >
                Relay eliminates custom glue code for webhook hosting, signature
                validation, prompt rendering, Devin orchestration, and GitHub
                output. No Zapier clone—it&apos;s{" "}
                <span className="rounded-[5px] bg-background p-1 font-semibold text-foreground">
                    AI orchestration infrastructure
                </span>{" "}
                for engineering signals.
            </Balancer>
        </section>
    );
}
