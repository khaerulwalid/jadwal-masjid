import { db } from "@/db";
import {
  attendances,
  appSettings,
  workSchedules,
  residents,
  groups,
} from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { UpdateAttendanceInput } from "@/lib/validation/attendance";

export class AttendanceService {
  static async getDefaultPaymentAmount(): Promise<number> {
    const settings = await db
      .select({ defaultAmount: appSettings.defaultReplacementAmount })
      .from(appSettings)
      .where(eq(appSettings.id, 1))
      .limit(1);

    if (settings.length === 0) {
      throw new Error("Pengaturan nominal pengganti kerja belum tersedia.");
    }

    return parseFloat(settings[0].defaultAmount);
  }

  static async getScheduleAttendanceAndSummary(scheduleId: string) {
    const rows = await db
      .select({
        id: attendances.id,
        status: attendances.status,
        paymentAmount: attendances.paymentAmount,
        paymentDate: attendances.paymentDate,
        notes: attendances.notes,
        markedAt: attendances.markedAt,
        resident: {
          id: residents.id,
          name: residents.name,
          phone: residents.phone,
        },
        group: {
          id: groups.id,
          name: groups.name,
          sequenceNo: groups.sequenceNo,
        },
      })
      .from(attendances)
      .innerJoin(residents, eq(residents.id, attendances.residentId))
      .innerJoin(groups, eq(groups.id, attendances.groupId))
      .where(eq(attendances.scheduleId, scheduleId))
      .orderBy(asc(groups.sequenceNo), asc(residents.name));

    const summary = {
      total: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      present: rows.filter((r) => r.status === "present").length,
      paid: rows.filter((r) => r.status === "paid").length,
      absent: rows.filter((r) => r.status === "absent").length,
    };

    return { attendances: rows, summary };
  }

  static async updateAttendance(
    input: UpdateAttendanceInput,
    adminId: string
  ) {
    return await db.transaction(async (tx) => {
      // 1. Get attendance and its schedule
      const atts = await tx
        .select({
          id: attendances.id,
          scheduleId: attendances.scheduleId,
        })
        .from(attendances)
        .where(eq(attendances.id, input.attendanceId))
        .limit(1);

      if (atts.length === 0) {
        throw new Error("Data kehadiran tidak ditemukan.");
      }
      const attendance = atts[0];

      // 2. Validate schedule status
      const schedules = await tx
        .select({ status: workSchedules.status })
        .from(workSchedules)
        .where(eq(workSchedules.id, attendance.scheduleId))
        .for("update") // slight lock on schedule to prevent concurrent completion
        .limit(1);

      if (schedules.length === 0) {
        throw new Error("Jadwal tidak ditemukan.");
      }

      if (schedules[0].status === "completed") {
        throw new Error("Jadwal sudah selesai dan tidak dapat diubah.");
      }
      if (schedules[0].status === "cancelled") {
        throw new Error("Jadwal sudah dibatalkan.");
      }

      // 3. Prepare update data
      const updateData: Record<string, unknown> = {
        status: input.status,
        notes: input.notes || null,
        markedBy: adminId,
        markedAt: sql`now()`,
        updatedAt: sql`now()`,
      };

      if (input.status === "paid") {
        updateData.paymentAmount = input.paymentAmount?.toString();
        updateData.paymentDate = input.paymentDate;
      } else {
        updateData.paymentAmount = null;
        updateData.paymentDate = null;
      }

      // 4. Update
      await tx
        .update(attendances)
        .set(updateData)
        .where(eq(attendances.id, input.attendanceId));
    });
  }

  static async bulkMarkPendingPresent(scheduleId: string, adminId: string) {
    return await db.transaction(async (tx) => {
      // 1. Validate schedule status
      const schedules = await tx
        .select({ status: workSchedules.status })
        .from(workSchedules)
        .where(eq(workSchedules.id, scheduleId))
        .for("update")
        .limit(1);

      if (schedules.length === 0) {
        throw new Error("Jadwal tidak ditemukan.");
      }

      if (schedules[0].status === "completed") {
        throw new Error("Jadwal sudah selesai dan tidak dapat diubah.");
      }
      if (schedules[0].status === "cancelled") {
        throw new Error("Jadwal sudah dibatalkan.");
      }

      // 2. Update all pending -> present
      await tx
        .update(attendances)
        .set({
          status: "present",
          paymentAmount: null,
          paymentDate: null,
          markedBy: adminId,
          markedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(attendances.scheduleId, scheduleId),
            eq(attendances.status, "pending")
          )
        );
    });
  }

  static async completeSchedule(scheduleId: string, _adminId: string) {
    return await db.transaction(async (tx) => {
      // 1. Lock schedule for update
      const schedules = await tx
        .select({ status: workSchedules.status })
        .from(workSchedules)
        .where(eq(workSchedules.id, scheduleId))
        .for("update")
        .limit(1);

      if (schedules.length === 0) {
        throw new Error("Jadwal tidak ditemukan.");
      }

      if (schedules[0].status === "completed") {
        throw new Error("Jadwal sudah selesai.");
      }
      if (schedules[0].status === "cancelled") {
        throw new Error("Jadwal sudah dibatalkan dan tidak dapat diselesaikan.");
      }

      // 2. Check pending attendances
      const pendingCountQuery = await tx
        .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
        .from(attendances)
        .where(
          and(
            eq(attendances.scheduleId, scheduleId),
            eq(attendances.status, "pending")
          )
        );

      const pendingCount = pendingCountQuery[0].count;

      if (pendingCount > 0) {
        throw new Error(`Masih ada ${pendingCount} masyarakat yang belum dicatat.`);
      }

      // 3. Complete schedule
      await tx
        .update(workSchedules)
        .set({
          status: "completed",
          completedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(workSchedules.id, scheduleId));
    });
  }
}
