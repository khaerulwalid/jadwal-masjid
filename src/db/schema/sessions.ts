import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token_hash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expires_at: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    last_seen_at: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
  },
  (table) => {
    return {
      user_idx: index("sessions_user_idx").on(table.user_id),
      expires_at_idx: index("sessions_expires_at_idx").on(table.expires_at),
    };
  }
);
