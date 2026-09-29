import { db } from "@/db";
import { residents, groups, workSchedules, attendances, rotationState, scheduleGroups } from "@/db/schema";
import { eq, and, ne, sql, desc, inArray } from "drizzle-orm";
import { getCurrentLocalDate } from "@/lib/date";

export async function getDashboardSummary() {
  const today = getCurrentLocalDate();
  const yearMonth = today.substring(0, 7); // YYYY-MM

  const [
    activeResidentsCount,
    activeGroupsCount,
    monthScheduleCount,
    monthReplacementAmount
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(residents)
      .where(eq(residents.isActive, true))
      .then(res => res[0]?.count || 0),

    db.select({ count: sql<number>`count(*)::int` })
      .from(groups)
      .where(eq(groups.isActive, true))
      .then(res => res[0]?.count || 0),

    db.select({ count: sql<number>`count(*)::int` })
      .from(workSchedules)
      .where(
        and(
          ne(workSchedules.status, 'cancelled'),
          sql`${workSchedules.workDate}::text LIKE ${yearMonth || ''} || '-%'`
        )
      )
      .then(res => res[0]?.count || 0),

    db.select({ total: sql<number>`sum(${attendances.paymentAmount})::numeric` })
      .from(attendances)
      .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
      .where(
        and(
          eq(attendances.status, 'paid'),
          ne(workSchedules.status, 'cancelled'),
          sql`${workSchedules.workDate}::text LIKE ${yearMonth || ''} || '-%'`
        )
      )
      .then(res => Number(res[0]?.total || 0)),
  ]);

  return {
    activeResidents: activeResidentsCount,
    activeGroups: activeGroupsCount,
    monthScheduleCount: monthScheduleCount,
    monthReplacementTotal: monthReplacementAmount
  };
}

export async function getTodayScheduleSummary() {
  const today = getCurrentLocalDate();

  const todaySchedule = await db.select()
    .from(workSchedules)
    .where(eq(workSchedules.workDate, today))
    .limit(1)
    .then(res => res[0] || null);

  let scheduleData = null;
  if (todaySchedule) {
    const groupsList = await db.select({
      id: groups.id,
      name: groups.name,
      orderNo: scheduleGroups.orderNo,
    })
    .from(scheduleGroups)
    .innerJoin(groups, eq(scheduleGroups.groupId, groups.id))
    .where(eq(scheduleGroups.scheduleId, todaySchedule.id))
    .orderBy(scheduleGroups.orderNo);

    const stats = await db.select({
      status: attendances.status,
      count: sql<number>`count(*)::int`,
    })
    .from(attendances)
    .where(eq(attendances.scheduleId, todaySchedule.id))
    .groupBy(attendances.status);

    let present = 0;
    let paid = 0;
    let absent = 0;
    let pending = 0;

    for (const stat of stats) {
      if (stat.status === 'present') present = stat.count;
      else if (stat.status === 'paid') paid = stat.count;
      else if (stat.status === 'absent') absent = stat.count;
      else if (stat.status === 'pending') pending = stat.count;
    }

    scheduleData = {
      ...todaySchedule,
      groups: groupsList,
      stats: {
        total: present + paid + absent + pending,
        present,
        paid,
        absent,
        pending
      }
    };
  }

  const rotation = await db.select({
    isPaused: rotationState.isPaused,
    nextGroupId: rotationState.nextGroupId,
    nextGroupName: groups.name,
  })
  .from(rotationState)
  .leftJoin(groups, eq(rotationState.nextGroupId, groups.id))
  .where(eq(rotationState.id, 1))
  .limit(1)
  .then(res => res[0] || { isPaused: false, nextGroupId: null, nextGroupName: null });

  return {
    todaySchedule: scheduleData,
    rotation
  };
}

export async function getRecentSchedules() {
  const schedules = await db.select()
    .from(workSchedules)
    .orderBy(desc(workSchedules.workDate))
    .limit(5);

  if (schedules.length === 0) return [];

  const scheduleIds = schedules.map(s => s.id);

  const groupsList = await db.select({
    scheduleId: scheduleGroups.scheduleId,
    name: groups.name,
    orderNo: scheduleGroups.orderNo,
  })
  .from(scheduleGroups)
  .innerJoin(groups, eq(scheduleGroups.groupId, groups.id))
  .where(inArray(scheduleGroups.scheduleId, scheduleIds))
  .orderBy(scheduleGroups.scheduleId, scheduleGroups.orderNo);

  const stats = await db.select({
    scheduleId: attendances.scheduleId,
    status: attendances.status,
    count: sql<number>`count(*)::int`,
  })
  .from(attendances)
  .where(inArray(attendances.scheduleId, scheduleIds))
  .groupBy(attendances.scheduleId, attendances.status);

  return schedules.map(schedule => {
    const sGroups = groupsList.filter(g => g.scheduleId === schedule.id);
    const sStats = stats.filter(s => s.scheduleId === schedule.id);
    
    let present = 0;
    let paid = 0;
    let absent = 0;
    let pending = 0;

    for (const stat of sStats) {
      if (stat.status === 'present') present = stat.count;
      else if (stat.status === 'paid') paid = stat.count;
      else if (stat.status === 'absent') absent = stat.count;
      else if (stat.status === 'pending') pending = stat.count;
    }

    return {
      ...schedule,
      groups: sGroups,
      stats: {
        total: present + paid + absent + pending,
        present,
        paid,
        absent,
        pending
      }
    };
  });
}
