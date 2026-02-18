import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { relayProjectsPageConfig } from "@/app/(app)/(user)/project/_constants/page-config";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectListLoading() {
    return (
        <AppPageLoading
            title={relayProjectsPageConfig.title}
            description={relayProjectsPageConfig.description}
        >
            <div className="flex justify-end">
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </AppPageLoading>
    );
}
