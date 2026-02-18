import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { triggersPageConfig } from "./_constants/page-config";
import { Skeleton } from "@/components/ui/skeleton";

export default function TriggersLoading() {
    return (
        <AppPageLoading
            title={triggersPageConfig.title}
            description={triggersPageConfig.description}
        >
            <div className="flex justify-end">
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="rounded-md border border-border">
                <Skeleton className="h-64 w-full" />
            </div>
        </AppPageLoading>
    );
}
