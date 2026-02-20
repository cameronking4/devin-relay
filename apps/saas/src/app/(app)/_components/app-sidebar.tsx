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
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import { sidebarConfig } from "@/config/sidebar";
import { userDropdownConfig } from "@/config/user-dropdown";
import { isLinkActive } from "@/lib/utils";
import type { User } from "next-auth";
import type { organizations } from "@/server/db/schema";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrgSelectDropdown, type UserOrgs } from "@/app/(app)/_components/org-select-dropdown";
import { UserDropdownContent } from "@/app/(app)/_components/user-dropdown-content";

function isAdminRole(role: string | null | undefined): boolean {
    return role === "Admin" || role === "Super Admin";
}

type AppSidebarProps = {
    user: User | null;
    currentOrg: typeof organizations.$inferSelect;
    userOrgs: UserOrgs[];
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    showOrgSwitcher?: boolean;
};

export function AppSidebar({
    user,
    currentOrg,
    userOrgs,
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    showOrgSwitcher = true,
}: AppSidebarProps) {
    const pathname = usePathname();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const navItems = sidebarConfig.filteredNavItems({
        removeIds: sidebarNavRemoveIds ?? [],
        includedIds: sidebarNavIncludeIds ?? [],
    });

    const userDropdownNavItems = isAdminRole(user?.role)
        ? userDropdownConfig.navigation
        : userDropdownConfig.filterNavItems({
              removeIds: [userDropdownConfig.navIds.admin],
          });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex min-w-0 flex-col gap-2 overflow-hidden px-2">
                    <Link
                        href={siteUrls.dashboard.home}
                        className={`flex items-center gap-2 transition-opacity hover:opacity-90 ${
                            isCollapsed
                                ? "!size-8 !min-w-0 justify-center p-1.5"
                                : ""
                        }`}
                        aria-label="Home"
                    >
                        <Icons.logo
                            className="text-xl shrink-0"
                            iconProps={{
                                className: `fill-primary transition-[width,height] ${
                                    isCollapsed ? "h-4 w-4" : "h-6 w-6"
                                }`,
                            }}
                        />
                    </Link>
                    {showOrgSwitcher && (
                        <OrgSelectDropdown
                            currentOrg={currentOrg}
                            userOrgs={userOrgs}
                            isCollapsed={isCollapsed}
                        />
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                {navItems.map((section) => (
                    <SidebarGroup key={section.id}>
                        {section.showLabel !== false && (
                            <SidebarGroupLabel>
                                {section.label}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
                                    if ("subMenu" in item && item.subMenu) {
                                        return (
                                            <SidebarMenuItem key={item.label}>
                                                <SidebarMenuButton
                                                    tooltip={item.label}
                                                    className="pointer-events-none"
                                                >
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                                <SidebarMenuSub>
                                                    {item.subMenu.map(
                                                        (subItem) => (
                                                            <SidebarMenuSubItem
                                                                key={
                                                                    subItem.label
                                                                }
                                                            >
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isLinkActive(
                                                                        subItem.href,
                                                                        pathname,
                                                                    )}
                                                                >
                                                                    <Link
                                                                        href={
                                                                            subItem.href
                                                                        }
                                                                    >
                                                                        <subItem.icon />
                                                                        <span>
                                                                            {
                                                                                subItem.label
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                    )}
                                                </SidebarMenuSub>
                                            </SidebarMenuItem>
                                        );
                                    }
                                    const href =
                                        "href" in item ? item.href : "#";
                                    const active = isLinkActive(href, pathname);
                                    return (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={active}
                                                tooltip={item.label}
                                            >
                                                <Link href={href}>
                                                    <item.icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <UserDropdownContent
                    user={user}
                    navItems={userDropdownNavItems}
                    isCollapsed={isCollapsed}
                />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
