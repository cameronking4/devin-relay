import { getUser } from "@/server/auth";
import { getOrganizations } from "@/server/actions/organization/queries";
import type { UserOrgs } from "@/app/(app)/_components/org-select-dropdown";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";

type SidebarWithDataProps = {
    sidebarNavIncludeIds?: string[];
    sidebarNavRemoveIds?: string[];
    showOrgSwitcher?: boolean;
};

export async function SidebarWithData({
    sidebarNavIncludeIds,
    sidebarNavRemoveIds,
    showOrgSwitcher = true,
}: SidebarWithDataProps) {
    const user = await getUser();
    const { currentOrg, userOrgs } = await getOrganizations();

    const myOrgs = userOrgs.filter((org) => org.ownerId === user?.id);
    const sharedOrgs = userOrgs.filter((org) => org.ownerId !== user?.id);

    const userOrgsData: UserOrgs[] = [
        { heading: "My Orgs", items: myOrgs },
        { heading: "Shared Orgs", items: sharedOrgs },
    ];

    return (
        <AppSidebar
            user={user}
            currentOrg={currentOrg}
            userOrgs={userOrgsData}
            sidebarNavIncludeIds={sidebarNavIncludeIds}
            sidebarNavRemoveIds={sidebarNavRemoveIds}
            showOrgSwitcher={showOrgSwitcher}
        />
    );
}
