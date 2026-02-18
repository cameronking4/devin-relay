import { Skeleton } from "@/components/ui/skeleton";

export default function ExecutionsLoading() {
    return (
        <div className="w-full space-y-8">
            <div>
                <header className="flex w-full flex-col gap-1 border-border">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-5 max-w-xl" />
                </header>
            </div>
            <main className="space-y-8 pb-8">
                <div className="flex flex-col gap-6">
                    <div className="rounded-md border border-border">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </main>
        </div>
    );
}
