import { PricingTable } from "@/app/(web)/pricing/_components/pricing-table";
import {
    WebPageHeader,
    WebPageWrapper,
} from "@/app/(web)/_components/general-components";
import { type Metadata } from "next";
import { pricingPageConfig } from "@/app/(web)/pricing/_constants/page-config";

/**
 * Customize the pricing page to your needs. You can use the `PricingPlans` component to display the pricing plans.
 * You can also use the `Badge` and `WebPageHeading` components to display the page title and any additional information.
 *
 * To customize the pricing plans, you can modify the `PricingPlans` component. @see /app/(web)/pricing/components/pricing-plans.tsx
 */

export const metadata: Metadata = {
    title: pricingPageConfig.title,
};

export default function PricingPage() {
    return (
        <WebPageWrapper>
            <WebPageHeader
                title="Simple Pricing for Platform & DevEx Teams"
                badge="MVP"
            >
                <p className="text-center text-base">
                    <span>No hidden fees </span>
                    <span className="font-light italic text-muted-foreground">
                        — start with one project, one webhook, one trigger
                    </span>
                </p>
            </WebPageHeader>

            <PricingTable />
        </WebPageWrapper>
    );
}
