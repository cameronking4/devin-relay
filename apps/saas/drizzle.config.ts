import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { env } from "@/env.js";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/server/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    tablesFilter: ["launchmvpfast-saas-starterkit_*"],
});
