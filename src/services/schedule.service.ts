import { db } from "@/db";
import {
  workSchedules,
  scheduleGroups,
  attendances,
  groups,
  groupMembers,
  residents,
  rotationState,
} from "@/db/schema";
import { eq, and, sql, isNull, inArray, desc } from "drizzle-orm";
import { ScheduleInput } from "@/lib/validation/schedule";

import { getNextActiveGroup, getNextGroups } from "@/lib/rotation";
import { getCurrentLocalDate } from "@/lib/date";

export class ScheduleService {
  static async getTodaySchedule() {
    const today = getCurrentLocalDate().split('T')[0];
    const schedules = await db
      .select({
        id: workSchedules.id,
        workDate: workSchedules.workDate,
        title: workSchedules.title,
        status: workSchedules.status,
        participantCount: sql<number>`CAST(COUNT(${attendances.id}) AS INTEGER)`,
        presentCount: sql<number>`CAST(SUM(CASE WHEN ${attendances.status} = 'present' THEN 1 ELSE 0 END) AS INTEGER)`,
        paidCount: sql<number>`CAST(SUM(CASE WHEN ${attendances.status} = 'paid' THEN 1 ELSE 0 END) AS INTEGER)`,
        absentCount: sql<number>`CAST(SUM(CASE WHEN ${attendances.status} = 'absent' THEN 1 ELSE 0 END) AS INTEGER)`,
        pendingCount: sql<number>`CAST(SUM(CASE WHEN ${attendances.status} = 'pending' THEN 1 ELSE 0 END) AS INTEGER)`,
        groupNames: sql<string>`STRING_AGG(DISTINCT ${groups.name}, ', ')`,
      })
      .from(workSchedules)
      .leftJoin(scheduleGroups, eq(scheduleGroups.scheduleId, workSchedules.id))
      .leftJoin(groups, eq(groups.id, scheduleGroups.groupId))
      .leftJoin(attendances, eq(attendances.scheduleId, workSchedules.id))
      .where(eq(workSchedules.workDate, today))
      .groupBy(workSchedules.id)
      .limit(1);
    
    return schedules.length > 0 ? schedules[0] : null;
  }

  static async getSchedules() {
    return await db
      .select({
        id: workSchedules.id,
        workDate: workSchedules.workDate,
        title: workSchedules.title,
        status: workSchedules.status,
        participantCount: sql<number>`CAST(COUNT(${attendances.id}) AS INTEGER)`,
        pendingCount: sql<number>`CAST(SUM(CASE WHEN ${attendances.status} = 'pending' THEN 1 ELSE 0 END) AS INTEGER)`,
        groupNames: sql<string>`STRING_AGG(DISTINCT ${groups.name}, ', ')`,
      })
      .from(workSchedules)
      .leftJoin(scheduleGroups, eq(scheduleGroups.scheduleId, workSchedules.id))
      .leftJoin(groups, eq(groups.id, scheduleGroups.groupId))
      .leftJoin(attendances, eq(attendances.scheduleId, workSchedules.id))
      .groupBy(workSchedules.id)
      .orderBy(desc(workSchedules.workDate));
  }

  static async getScheduleById(id: string) {
    const schedules = await db
      .select()
      .from(workSchedules)
      .where(eq(workSchedules.id, id))
      .limit(1);

    if (schedules.length === 0) return null;
    const schedule = schedules[0];

    // Fetch groups in order
    const scheduledGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        sequenceNo: groups.sequenceNo,
        orderNo: scheduleGroups.orderNo,
      })
      .from(scheduleGroups)
      .innerJoin(groups, eq(groups.id, scheduleGroups.groupId))
      .where(eq(scheduleGroups.scheduleId, id))
      .orderBy(scheduleGroups.orderNo);

    // Fetch snapshot attendance
    const participants = await db
      .select({
        id: attendances.id,
        status: attendances.status,
        resident: {
          id: residents.id,
          name: residents.name,
          phone: residents.phone,
        },
        group: {
          id: groups.id,
          name: groups.name,
        },
      })
      .from(attendances)
      .innerJoin(residents, eq(residents.id, attendances.residentId))
      .innerJoin(groups, eq(groups.id, attendances.groupId))
      .where(eq(attendances.scheduleId, id))
      .orderBy(residents.name);

    return {
      ...schedule,
      scheduledGroups,
      participants,
    };
  }

  static async createSchedule(input: ScheduleInput, adminId: string) {
    // 1. Check for duplicate work_date first to fail early
    const existingSchedule = await db
      .select({ id: workSchedules.id })
      .from(workSchedules)
      .where(eq(workSchedules.workDate, input.workDate))
      .limit(1);

    if (existingSchedule.length > 0) {
      throw new Error("Tanggal tersebut sudah memiliki jadwal gotong royong.");
    }

    // Determine if we need to lock rotation state
    const needsRotationLock = input.mode === "rotation" || (input.mode === "manual" && input.advanceRotation);

    return await db.transaction(async (tx) => {
      let stateRecord = null;

      if (needsRotationLock) {
        // FOR UPDATE lock
        const stateResult = await tx
          .select()
          .from(rotationState)
          .where(eq(rotationState.id, 1))
          .for("update")
          .limit(1);
          
        if (stateResult.length > 0) {
          stateRecord = stateResult[0];
        } else {
          throw new Error("Sistem rotasi belum diatur. Atur rotasi terlebih dahulu.");
        }
      }

      // Load active groups in order
      const activeGroups = await tx
        .select({
          id: groups.id,
          name: groups.name,
          sequenceNo: groups.sequenceNo,
        })
        .from(groups)
        .where(eq(groups.isActive, true))
        .orderBy(groups.sequenceNo);

      if (activeGroups.length === 0) {
        throw new Error("Tidak ada kelompok aktif.");
      }

      let selectedGroupIds: string[] = [];
      let newNextGroupId: string | null = null;

      if (input.mode === "rotation") {
        if (!stateRecord) throw new Error("Internal error: Rotation state not locked.");
        if (stateRecord.isPaused) {
          throw new Error("Rotasi sedang dijeda. Gunakan Mode Manual atau lanjutkan rotasi terlebih dahulu.");
        }
        if (!stateRecord.nextGroupId) {
          throw new Error("Kelompok berikutnya belum ditentukan. Atur rotasi terlebih dahulu.");
        }

        const count = input.groupCount;
        if (count > activeGroups.length) {
          throw new Error("Jumlah kelompok melebihi jumlah kelompok aktif.");
        }

        // Generate rotation sequence
        const sequence = getNextGroups(stateRecord.nextGroupId, activeGroups, count);
        selectedGroupIds = sequence.map((g) => g.id);

        // Successor after last group
        const lastGroupId = selectedGroupIds[selectedGroupIds.length - 1];
        const nextGroup = getNextActiveGroup(lastGroupId, activeGroups);
        newNextGroupId = nextGroup.id;
      } else {
        // Manual mode
        selectedGroupIds = input.groupIds;
        
        // Verify groups are valid active groups
        for (const id of selectedGroupIds) {
          const group = activeGroups.find((g) => g.id === id);
          if (!group) {
            throw new Error(`Kelompok dengan ID ${id} tidak valid atau sudah tidak aktif.`);
          }
        }

        if (input.advanceRotation) {
          // Successor is based on the LAST group in the manual selection array
          const lastGroupId = selectedGroupIds[selectedGroupIds.length - 1];
          const nextGroup = getNextActiveGroup(lastGroupId, activeGroups);
          newNextGroupId = nextGroup.id;
        }
      }

      // 8. INSERT work_schedule
      const newSchedule = await tx
        .insert(workSchedules)
        .values({
          workDate: input.workDate,
          title: input.title || null,
          notes: input.notes || null,
          status: "scheduled",
          createdBy: adminId,
        })
        .returning({ id: workSchedules.id });

      const scheduleId = newSchedule[0].id;

      // 9. INSERT schedule_groups
      const scheduleGroupValues = selectedGroupIds.map((groupId, index) => ({
        scheduleId,
        groupId,
        orderNo: index + 1,
      }));
      
      await tx.insert(scheduleGroups).values(scheduleGroupValues);

      // 10. Snapshot active members
      const activeMembers = await tx
        .select({
          residentId: groupMembers.residentId,
          groupId: groupMembers.groupId,
        })
        .from(groupMembers)
        .innerJoin(residents, eq(residents.id, groupMembers.residentId))
        .where(
          and(
            inArray(groupMembers.groupId, selectedGroupIds),
            isNull(groupMembers.leftAt),
            eq(residents.isActive, true)
          )
        );

      // 11. INSERT attendance snapshot
      if (activeMembers.length > 0) {
        const attendanceValues = activeMembers.map((m) => ({
          scheduleId,
          residentId: m.residentId,
          groupId: m.groupId,
          status: "pending",
        }));
        await tx.insert(attendances).values(attendanceValues);
      }

      // 13. UPDATE rotation pointer jika diperlukan
      if (needsRotationLock && newNextGroupId) {
        await tx
          .update(rotationState)
          .set({
            nextGroupId: newNextGroupId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(rotationState.id, 1));
      }

      return scheduleId;
    });
  }

  static async cancelSchedule(scheduleId: string) {
    return await db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: workSchedules.id, status: workSchedules.status })
        .from(workSchedules)
        .where(eq(workSchedules.id, scheduleId))
        .for("update")
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Jadwal tidak ditemukan.");
      }

      if (existing[0].status !== "scheduled") {
        throw new Error("Hanya jadwal dengan status 'scheduled' yang dapat dibatalkan.");
      }

      await tx
        .update(workSchedules)
        .set({
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(workSchedules.id, scheduleId));
    });
  }
}
