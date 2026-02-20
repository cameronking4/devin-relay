"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

type SidebarLoadingProps = {
    showOrgSwitcher?: boolean;
};

export function SidebarLoading({
    showOrgSwitcher = true,
}: SidebarLoadingProps) {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex flex-col gap-2 px-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    {showOrgSwitcher && (
                        <Skeleton className="h-9 w-full rounded-md" />
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                {[1, 2, 3].map((i) => (
                    <SidebarGroup key={i}>
                        <SidebarGroupLabel>
                            <Skeleton className="h-4 w-16" />
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {[1, 2].map((j) => (
                                    <SidebarMenuItem key={j}>
                                        <SidebarMenuSkeleton showIcon />
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <Skeleton className="h-9 w-full rounded-md" />
            </SidebarFooter>
        </Sidebar>
    );
}
