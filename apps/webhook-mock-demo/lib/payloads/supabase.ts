import { randomUUID } from "crypto";

const TABLES = [
  { table: "orders", schema: "public" },
  { table: "profiles", schema: "public" },
  { table: "notifications", schema: "public" },
] as const;

export function generateSupabasePayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const { table, schema } = TABLES[Math.floor(Math.random() * TABLES.length)];
  const now = new Date().toISOString();

  const baseRecord = {
    id: randomUUID(),
    created_at: now,
    updated_at: now,
  };

  switch (eventType) {
    case "db_insert": {
      const record =
        table === "orders"
          ? {
              ...baseRecord,
              user_id: randomUUID(),
              status: "pending",
              total_cents: 4999,
              items: [{ sku: "PRO-001", qty: 1, price_cents: 4999 }],
            }
          : table === "profiles"
            ? {
                ...baseRecord,
                user_id: randomUUID(),
                full_name: "New User",
                avatar_url: "https://avatars.example.com/default.png",
              }
            : {
                ...baseRecord,
                user_id: randomUUID(),
                type: "alert",
                title: "Deployment complete",
                read: false,
              };
      return {
        payload: { type: "INSERT", schema, table, record, old_record: null },
        headers: { "Content-Type": "application/json", "X-Supabase-Webhook-Type": "database" },
      };
    }

    case "db_update": {
      const oldRecord =
        table === "orders"
          ? { ...baseRecord, user_id: randomUUID(), status: "pending", total_cents: 4999, updated_at: new Date(Date.now() - 60000).toISOString() }
          : table === "profiles"
            ? { ...baseRecord, user_id: randomUUID(), full_name: "Old Name", updated_at: new Date(Date.now() - 3600000).toISOString() }
            : { ...baseRecord, user_id: randomUUID(), read: false, updated_at: new Date(Date.now() - 300000).toISOString() };

      const record =
        table === "orders"
          ? { ...oldRecord, status: "completed", updated_at: now }
          : table === "profiles"
            ? { ...oldRecord, full_name: "Updated Name", updated_at: now }
            : { ...oldRecord, read: true, updated_at: now };

      return {
        payload: { type: "UPDATE", schema, table, record, old_record: oldRecord },
        headers: { "Content-Type": "application/json", "X-Supabase-Webhook-Type": "database" },
      };
    }

    case "db_delete": {
      const oldRecord =
        table === "orders"
          ? { ...baseRecord, user_id: randomUUID(), status: "canceled", total_cents: 0 }
          : table === "profiles"
            ? { ...baseRecord, user_id: randomUUID(), full_name: "Deleted User" }
            : { ...baseRecord, user_id: randomUUID(), type: "alert", read: true };

      return {
        payload: { type: "DELETE", schema, table, record: null, old_record: oldRecord },
        headers: { "Content-Type": "application/json", "X-Supabase-Webhook-Type": "database" },
      };
    }

    default:
      throw new Error(`Unknown Supabase event type: ${eventType}`);
  }
}
