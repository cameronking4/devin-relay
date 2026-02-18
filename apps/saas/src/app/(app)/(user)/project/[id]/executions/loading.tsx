import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { executionsPageConfig } from "./_constants/page-config";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExecutionsLoading() {
    return (
        <AppPageLoading
            title={executionsPageConfig.title}
            description={executionsPageConfig.description}
        >
            <div className="rounded-md border border-border">
                <Skeleton className="h-64 w-full" />
            </div>
        </AppPageLoading>
    );
}
