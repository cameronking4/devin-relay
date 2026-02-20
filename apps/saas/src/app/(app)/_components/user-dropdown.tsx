import { userDropdownConfig } from "@/config/user-dropdown";
import { usersRoleEnum } from "@/server/db/schema";
import type { User } from "next-auth";
import { z } from "zod";
import { UserDropdownContent } from "@/app/(app)/_components/user-dropdown-content";

/**
 * to @add more navigation items to the user dropdown, you can add more items to the `userDropdownConfig` object in the
 * @see /src/config/user-dropdown.ts file
 */

type UserDropdownProps = {
    user: User | null;
};

const userRoles = z.enum(usersRoleEnum.enumValues);

export async function UserDropdown({ user }: UserDropdownProps) {
    const navItems =
        user?.role === userRoles.Values.Admin ||
        user?.role === userRoles.Values["Super Admin"]
            ? userDropdownConfig.navigation
            : userDropdownConfig.filterNavItems({
                  removeIds: [userDropdownConfig.navIds.admin],
              });

    return <UserDropdownContent user={user} navItems={navItems} />;
}
