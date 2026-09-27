import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { residents } from "./schema/residents";
import { groups } from "./schema/groups";
import { groupMembers } from "./schema/group-members";
import { workSchedules } from "./schema/work-schedules";
import { scheduleGroups } from "./schema/schedule-groups";
import { attendances } from "./schema/attendances";
import { sessions } from "./schema/sessions";

export const usersRelations = relations(users, ({ many }) => ({
  workSchedules: many(workSchedules),
  attendancesMarked: many(attendances),
  sessions: many(sessions),
}));

export const residentsRelations = relations(residents, ({ many }) => ({
  memberships: many(groupMembers),
  attendances: many(attendances),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  scheduleGroups: many(scheduleGroups),
  attendances: many(attendances),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  resident: one(residents, {
    fields: [groupMembers.residentId],
    references: [residents.id],
  }),
}));

export const workSchedulesRelations = relations(workSchedules, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [workSchedules.createdBy],
    references: [users.id],
  }),
  scheduleGroups: many(scheduleGroups),
  attendances: many(attendances),
}));

export const scheduleGroupsRelations = relations(scheduleGroups, ({ one }) => ({
  schedule: one(workSchedules, {
    fields: [scheduleGroups.scheduleId],
    references: [workSchedules.id],
  }),
  group: one(groups, {
    fields: [scheduleGroups.groupId],
    references: [groups.id],
  }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  schedule: one(workSchedules, {
    fields: [attendances.scheduleId],
    references: [workSchedules.id],
  }),
  resident: one(residents, {
    fields: [attendances.residentId],
    references: [residents.id],
  }),
  group: one(groups, {
    fields: [attendances.groupId],
    references: [groups.id],
  }),
  markedBy: one(users, {
    fields: [attendances.markedBy],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));
