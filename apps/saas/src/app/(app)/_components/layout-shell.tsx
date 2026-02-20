import { AppHeader } from "@/app/(app)/_components/app-header";
import { SidebarLoading } from "@/app/(app)/_components/sidebar-loading";
import { SidebarWithData } from "@/app/(app)/_components/sidebar-with-data";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { Suspense } from "react";

type AppLayoutProps = {
    children: React.ReactNode;
    sideNavRemoveIds?: string[];
    sideNavIncludedIds?: string[];
    showOrgSwitcher?: boolean;
};

/**
 * App shell: SidebarProvider + sidebar (with data) + SidebarInset (header + main content).
 */

export function AppLayoutShell({
    children,
    sideNavIncludedIds,
    sideNavRemoveIds,
    showOrgSwitcher,
}: AppLayoutProps) {
    return (
        <SidebarProvider>
            <Suspense
                fallback={
                    <SidebarLoading showOrgSwitcher={showOrgSwitcher} />
                }
            >
                <SidebarWithData
                    sidebarNavIncludeIds={sideNavIncludedIds}
                    sidebarNavRemoveIds={sideNavRemoveIds}
                    showOrgSwitcher={showOrgSwitcher}
                />
            </Suspense>
            <SidebarInset className="min-w-0 md:m-4  md:rounded-xl md:overflow-hidden md:shadow-lg md:border md:border-border">
                <div className="sticky left-0 right-0 top-0 z-50 border-b border-border bg-background px-4">
                    <AppHeader showOrgSwitcher={showOrgSwitcher} />
                </div>
                <section className="min-h-auto max-h-full w-full flex-1 px-4 mr-4">
                    {children}
                </section>
            </SidebarInset>
        </SidebarProvider>
    );
}
