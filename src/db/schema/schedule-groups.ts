import { integer, pgTable, timestamp, unique, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { groups } from "./groups";
import { workSchedules } from "./work-schedules";

export const scheduleGroups = pgTable("schedule_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").notNull().references(() => workSchedules.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  orderNo: integer("order_no").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    orderNoCheck: check("schedule_groups_order_no_check", sql`${table.orderNo} > 0`),
    uniqueScheduleGroup: unique("schedule_groups_schedule_group_unique").on(table.scheduleId, table.groupId),
    uniqueScheduleOrder: unique("schedule_groups_schedule_order_unique").on(table.scheduleId, table.orderNo),
  };
});
