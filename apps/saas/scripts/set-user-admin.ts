/**
 * One-off: set user by email as app Admin and org Admin for all their memberships.
 * Run from apps/saas: pnpm exec tsx scripts/set-user-admin.ts
 */
import "dotenv/config";
import { db } from "../src/server/db";
import {
    membersToOrganizations,
    users,
} from "../src/server/db/schema";
import { eq } from "drizzle-orm";

const EMAIL = "cyking1233@gmail.com";

async function main() {
    const [user] = await db
        .select({ id: users.id, name: users.name, role: users.role })
        .from(users)
        .where(eq(users.email, EMAIL))
        .limit(1);

    if (!user) {
        console.error(`User not found: ${EMAIL}`);
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.id}), current role: ${user.role}`);

    await db.update(users).set({ role: "Admin" }).where(eq(users.id, user.id));
    console.log("Updated user.role to Admin");

    const result = await db
        .update(membersToOrganizations)
        .set({ role: "Admin" })
        .where(eq(membersToOrganizations.memberId, user.id))
        .returning({ id: membersToOrganizations.id, organizationId: membersToOrganizations.organizationId });

    if (result.length > 0) {
        console.log(`Updated ${result.length} org membership(s) to Admin`);
    } else {
        console.log("No org memberships to update (user may not be in any org yet).");
    }

    console.log("Done. Cameron King (cyking1233@gmail.com) is now app Admin and org Admin.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
