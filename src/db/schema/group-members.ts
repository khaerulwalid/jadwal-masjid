import { date, index, pgTable, timestamp, uniqueIndex, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { groups } from "./groups";
import { residents } from "./residents";

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  residentId: uuid("resident_id").notNull().references(() => residents.id),
  joinedAt: date("joined_at", { mode: "string" }).notNull().defaultNow(),
  leftAt: date("left_at", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    leftAtCheck: check("group_members_left_at_check", sql`${table.leftAt} IS NULL OR ${table.leftAt} >= ${table.joinedAt}`),
    activeMembershipUniqueIdx: uniqueIndex("group_members_active_membership_idx")
      .on(table.residentId)
      .where(sql`${table.leftAt} IS NULL`),
    activeGroupIdx: index("group_members_active_group_idx")
      .on(table.groupId)
      .where(sql`${table.leftAt} IS NULL`),
  };
});
