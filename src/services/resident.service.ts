import { db } from "@/db";
import { residents } from "@/db/schema";
import { eq, ilike, and, or, sql, asc, desc, ne } from "drizzle-orm";
import { ResidentInput } from "@/lib/validation/resident";
import { attendances, workSchedules, groups } from "@/db/schema";

export type GetResidentsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
};

export class ResidentService {
  static async getResidents(params: GetResidentsParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, params.pageSize || 20);
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (params.search) {
      conditions.push(
        or(
          ilike(residents.name, `%${params.search}%`),
          ilike(residents.phone, `%${params.search}%`) // Wait, phone may be null, but ilike handles nulls by returning false.
        )
      );
    }

    if (params.status === "active") {
      conditions.push(eq(residents.isActive, true));
    } else if (params.status === "inactive") {
      conditions.push(eq(residents.isActive, false));
    }
    // "all" does nothing

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult, items] = await Promise.all([
      db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(residents)
        .where(where),
      db
        .select()
        .from(residents)
        .where(where)
        .orderBy(asc(residents.name), asc(residents.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  static async getResidentById(id: string) {
    const result = await db
      .select()
      .from(residents)
      .where(eq(residents.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  static async createResident(input: ResidentInput) {
    const result = await db
      .insert(residents)
      .values({
        name: input.name,
        phone: input.phone || null,
        address: input.address || null,
        isActive: true,
      })
      .returning();

    return result[0];
  }

  static async updateResident(id: string, input: ResidentInput) {
    const result = await db
      .update(residents)
      .set({
        name: input.name,
        phone: input.phone || null,
        address: input.address || null,
        updatedAt: new Date().toISOString(), // Wait, createdAt/updatedAt mode is "string" based on the schema! So it should be a string.
      })
      .where(eq(residents.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Data masyarakat tidak ditemukan.");
    }

    return result[0];
  }

  static async setResidentActiveStatus(id: string, isActive: boolean) {
    return await db.transaction(async (tx) => {
      const result = await tx
        .update(residents)
        .set({
          isActive: isActive,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(residents.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Data masyarakat tidak ditemukan.");
      }

      // Business rule: close active membership if deactivated
      if (!isActive) {
        const { groupMembers } = await import("@/db/schema");
        const { isNull } = await import("drizzle-orm");
        const { getCurrentLocalDate } = await import("@/lib/date");
        
        await tx
          .update(groupMembers)
          .set({ leftAt: getCurrentLocalDate() })
          .where(
            and(
              eq(groupMembers.residentId, id),
              isNull(groupMembers.leftAt)
            )
          );
      }

      return result[0];
    });
  }

  static async getResidentAttendanceHistory(residentId: string, limit: number = 10) {
    return await db.select({
      scheduleId: workSchedules.id,
      workDate: workSchedules.workDate,
      status: workSchedules.status,
      groupName: groups.name,
      attendanceStatus: attendances.status,
      paymentAmount: attendances.paymentAmount,
      notes: attendances.notes,
    })
    .from(attendances)
    .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
    .innerJoin(groups, eq(attendances.groupId, groups.id))
    .where(eq(attendances.residentId, residentId))
    .orderBy(desc(workSchedules.workDate))
    .limit(limit);
  }

  static async getResidentAttendanceHistoryAll(residentId: string) {
    return await db.select({
      scheduleId: workSchedules.id,
      workDate: workSchedules.workDate,
      status: workSchedules.status,
      groupName: groups.name,
      attendanceStatus: attendances.status,
      paymentAmount: attendances.paymentAmount,
      paymentDate: attendances.paymentDate,
      notes: attendances.notes,
    })
    .from(attendances)
    .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
    .innerJoin(groups, eq(attendances.groupId, groups.id))
    .where(and(eq(attendances.residentId, residentId), ne(workSchedules.status, 'cancelled')))
    .orderBy(desc(workSchedules.workDate));
  }

  static async getResidentAttendanceSummary(residentId: string) {
    const stats = await db.select({
      status: attendances.status,
      count: sql<number>`count(*)::int`,
    })
    .from(attendances)
    .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
    .where(
      and(
        eq(attendances.residentId, residentId),
        ne(workSchedules.status, 'cancelled')
      )
    )
    .groupBy(attendances.status);

    const summary = { scheduled: 0, present: 0, paid: 0, absent: 0 };
    for (const stat of stats) {
      if (stat.status === 'present') summary.present = stat.count;
      else if (stat.status === 'paid') summary.paid = stat.count;
      else if (stat.status === 'absent') summary.absent = stat.count;
      
      summary.scheduled += stat.count;
    }
    return summary;
  }
}
