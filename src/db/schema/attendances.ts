import { date, index, numeric, pgTable, text, timestamp, unique, varchar, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { groups } from "./groups";
import { residents } from "./residents";
import { users } from "./users";
import { workSchedules } from "./work-schedules";

export const attendances = pgTable("attendances", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").notNull().references(() => workSchedules.id, { onDelete: "cascade" }),
  residentId: uuid("resident_id").notNull().references(() => residents.id),
  groupId: uuid("group_id").notNull().references(() => groups.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentAmount: numeric("payment_amount", { precision: 12, scale: 2 }),
  paymentDate: date("payment_date", { mode: "string" }),
  notes: text("notes"),
  markedBy: uuid("marked_by").references(() => users.id),
  markedAt: timestamp("marked_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    statusCheck: check("attendances_status_check", sql`${table.status} IN ('pending', 'present', 'paid', 'absent')`),
    paymentCheck: check("attendances_payment_check", sql`
      (
        ${table.status} = 'paid'
        AND ${table.paymentAmount} IS NOT NULL
        AND ${table.paymentAmount} > 0
        AND ${table.paymentDate} IS NOT NULL
      )
      OR
      (
        ${table.status} <> 'paid'
        AND ${table.paymentAmount} IS NULL
        AND ${table.paymentDate} IS NULL
      )
    `),
    uniqueScheduleResident: unique("attendances_schedule_resident_unique").on(table.scheduleId, table.residentId),
    scheduleIdx: index("attendances_schedule_idx").on(table.scheduleId),
    residentIdx: index("attendances_resident_idx").on(table.residentId),
    groupIdx: index("attendances_group_idx").on(table.groupId),
    statusIdx: index("attendances_status_idx").on(table.status),
  };
});
