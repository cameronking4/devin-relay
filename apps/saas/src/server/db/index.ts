import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env.js";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

const conn =
    globalForDb.conn ??
    postgres(env.DATABASE_URL, {
        max: 20,
        idle_timeout: 20,
        connect_timeout: 10,
        max_lifetime: 60 * 30,
    });
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
