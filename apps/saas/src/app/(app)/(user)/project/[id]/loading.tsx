import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectOverviewLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-9 w-64" />
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-52 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-32" />
            </div>
        </div>
    );
}
