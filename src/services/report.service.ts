import { db } from "@/db";
import { workSchedules, attendances, groups, residents, scheduleGroups } from "@/db/schema";
import { eq, and, ne, sql, desc, inArray, gte, lte } from "drizzle-orm";
import { ReportFilterParams } from "@/lib/validation/report";

export async function getReportSummary(filters: ReportFilterParams) {
  const { startDate, endDate, status, groupId } = filters;
  
  const conditions = [];
  if (startDate) conditions.push(gte(workSchedules.workDate, startDate));
  if (endDate) conditions.push(lte(workSchedules.workDate, endDate));
  if (status && status !== 'all') conditions.push(eq(workSchedules.status, status));
  if (!status || status === 'completed') conditions.push(ne(workSchedules.status, 'cancelled'));

  if (groupId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM ${scheduleGroups} sg WHERE sg.schedule_id = ${workSchedules.id} AND sg.group_id = ${groupId})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [scheduleCountResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(workSchedules)
    .where(whereClause);

  const schedules = await db.select({ id: workSchedules.id })
    .from(workSchedules)
    .where(whereClause);

  const scheduleIds = schedules.map(s => s.id);

  const stats = {
    present: 0,
    paid: 0,
    absent: 0,
    pending: 0,
    totalPayment: 0,
    totalParticipants: 0,
  };

  if (scheduleIds.length > 0) {
    const attendanceConditions = [inArray(attendances.scheduleId, scheduleIds)];
    if (groupId) attendanceConditions.push(eq(attendances.groupId, groupId));

    const agg = await db.select({
      status: attendances.status,
      count: sql<number>`count(*)::int`,
      totalPayment: sql<number>`sum(${attendances.paymentAmount})::numeric`,
    })
    .from(attendances)
    .where(and(...attendanceConditions))
    .groupBy(attendances.status);

    for (const stat of agg) {
      if (stat.status === 'present') stats.present = stat.count;
      else if (stat.status === 'paid') {
        stats.paid = stat.count;
        stats.totalPayment = Number(stat.totalPayment || 0);
      }
      else if (stat.status === 'absent') stats.absent = stat.count;
      else if (stat.status === 'pending') stats.pending = stat.count;
    }
    stats.totalParticipants = stats.present + stats.paid + stats.absent + stats.pending;
  }

  const recorded = stats.present + stats.paid + stats.absent;
  let attendanceRate = 0;
  if (recorded > 0) {
    attendanceRate = Math.round((stats.present / recorded) * 100);
  }

  return {
    scheduleCount: scheduleCountResult?.count || 0,
    ...stats,
    attendanceRate,
  };
}

export async function getActivityReport(filters: ReportFilterParams) {
  const { startDate, endDate, status, groupId, page = 1 } = filters;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (startDate) conditions.push(gte(workSchedules.workDate, startDate));
  if (endDate) conditions.push(lte(workSchedules.workDate, endDate));
  if (status && status !== 'all') conditions.push(eq(workSchedules.status, status));
  if (!status || status === 'completed') conditions.push(ne(workSchedules.status, 'cancelled'));

  if (groupId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM ${scheduleGroups} sg WHERE sg.schedule_id = ${workSchedules.id} AND sg.group_id = ${groupId})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const schedules = await db.select()
    .from(workSchedules)
    .where(whereClause)
    .orderBy(desc(workSchedules.workDate))
    .limit(pageSize)
    .offset(offset);

  if (schedules.length === 0) return { data: [], total: 0 };

  const [totalCountResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(workSchedules)
    .where(whereClause);

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

  const attendanceConditions = [inArray(attendances.scheduleId, scheduleIds)];
  if (groupId) attendanceConditions.push(eq(attendances.groupId, groupId));

  const stats = await db.select({
    scheduleId: attendances.scheduleId,
    status: attendances.status,
    count: sql<number>`count(*)::int`,
    totalPayment: sql<number>`sum(${attendances.paymentAmount})::numeric`,
  })
  .from(attendances)
  .where(and(...attendanceConditions))
  .groupBy(attendances.scheduleId, attendances.status);

  const data = schedules.map(schedule => {
    const sGroups = groupsList.filter(g => g.scheduleId === schedule.id);
    const sStats = stats.filter(s => s.scheduleId === schedule.id);
    
    let present = 0, paid = 0, absent = 0, pending = 0, totalPayment = 0;

    for (const stat of sStats) {
      if (stat.status === 'present') present = stat.count;
      else if (stat.status === 'paid') {
        paid = stat.count;
        totalPayment = Number(stat.totalPayment || 0);
      }
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
        pending,
        totalPayment,
      }
    };
  });

  return {
    data,
    total: totalCountResult?.count || 0,
    page,
    pageSize,
  };
}

export async function getGroupSummaryReport(filters: ReportFilterParams) {
  const { startDate, endDate, status, groupId } = filters;
  
  const scheduleConditions = [];
  if (startDate) scheduleConditions.push(gte(workSchedules.workDate, startDate));
  if (endDate) scheduleConditions.push(lte(workSchedules.workDate, endDate));
  if (status && status !== 'all') scheduleConditions.push(eq(workSchedules.status, status));
  if (!status || status === 'completed') scheduleConditions.push(ne(workSchedules.status, 'cancelled'));

  const whereClause = scheduleConditions.length > 0 ? and(...scheduleConditions) : undefined;
  
  const schedules = await db.select({ id: workSchedules.id }).from(workSchedules).where(whereClause);
  const scheduleIds = schedules.map(s => s.id);

  if (scheduleIds.length === 0) return [];

  // Count distinct schedules per group
  const sgConditions = [inArray(scheduleGroups.scheduleId, scheduleIds)];
  if (groupId) sgConditions.push(eq(scheduleGroups.groupId, groupId));

  const groupSchedulesCount = await db.select({
    groupId: scheduleGroups.groupId,
    count: sql<number>`count(distinct ${scheduleGroups.scheduleId})::int`
  })
  .from(scheduleGroups)
  .where(and(...sgConditions))
  .groupBy(scheduleGroups.groupId);

  const groupMap = new Map();
  for (const gc of groupSchedulesCount) {
    groupMap.set(gc.groupId, {
      scheduleCount: gc.count,
      present: 0, paid: 0, absent: 0, pending: 0, totalPayment: 0
    });
  }

  // Get attendances
  const attConditions = [inArray(attendances.scheduleId, scheduleIds)];
  if (groupId) attConditions.push(eq(attendances.groupId, groupId));

  const attStats = await db.select({
    groupId: attendances.groupId,
    status: attendances.status,
    count: sql<number>`count(*)::int`,
    totalPayment: sql<number>`sum(${attendances.paymentAmount})::numeric`
  })
  .from(attendances)
  .where(and(...attConditions))
  .groupBy(attendances.groupId, attendances.status);

  for (const stat of attStats) {
    if (!groupMap.has(stat.groupId)) {
      groupMap.set(stat.groupId, { scheduleCount: 0, present: 0, paid: 0, absent: 0, pending: 0, totalPayment: 0 });
    }
    const g = groupMap.get(stat.groupId);
    if (stat.status === 'present') g.present = stat.count;
    else if (stat.status === 'paid') {
      g.paid = stat.count;
      g.totalPayment = Number(stat.totalPayment || 0);
    }
    else if (stat.status === 'absent') g.absent = stat.count;
    else if (stat.status === 'pending') g.pending = stat.count;
  }

  // Fetch group names
  const allGroupIds = Array.from(groupMap.keys());
  if (allGroupIds.length === 0) return [];

  const groupsData = await db.select({
    id: groups.id,
    name: groups.name,
    sequenceNo: groups.sequenceNo,
  }).from(groups).where(inArray(groups.id, allGroupIds));

  const result = groupsData.map(g => {
    const stats = groupMap.get(g.id);
    const recorded = stats.present + stats.paid + stats.absent;
    const attendanceRate = recorded > 0 ? Math.round((stats.present / recorded) * 100) : 0;
    const totalParticipants = stats.present + stats.paid + stats.absent + stats.pending;

    return {
      ...g,
      scheduleCount: stats.scheduleCount,
      totalParticipants,
      present: stats.present,
      paid: stats.paid,
      absent: stats.absent,
      pending: stats.pending,
      attendanceRate,
      totalPayment: stats.totalPayment
    };
  });

  return result.sort((a, b) => a.sequenceNo - b.sequenceNo);
}

export async function getPaymentReport(filters: ReportFilterParams) {
  const { startDate, endDate, status, groupId, page = 1 } = filters;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const conditions = [
    eq(attendances.status, 'paid')
  ];

  if (startDate) conditions.push(gte(workSchedules.workDate, startDate));
  if (endDate) conditions.push(lte(workSchedules.workDate, endDate));
  if (status && status !== 'all') conditions.push(eq(workSchedules.status, status));
  if (!status || status === 'completed') conditions.push(ne(workSchedules.status, 'cancelled'));
  if (groupId) conditions.push(eq(attendances.groupId, groupId));

  const query = db.select({
    id: attendances.id,
    paymentAmount: attendances.paymentAmount,
    paymentDate: attendances.paymentDate,
    notes: attendances.notes,
    residentName: residents.name,
    groupName: groups.name,
    workDate: workSchedules.workDate,
    scheduleId: workSchedules.id,
  })
  .from(attendances)
  .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
  .innerJoin(residents, eq(attendances.residentId, residents.id))
  .innerJoin(groups, eq(attendances.groupId, groups.id))
  .where(and(...conditions));

  const data = await query
    .orderBy(desc(attendances.paymentDate), desc(workSchedules.workDate), residents.name)
    .limit(pageSize)
    .offset(offset);

  const [totalCountResult] = await db.select({ count: sql<number>`count(*)::int` })
    .from(attendances)
    .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
    .where(and(...conditions));

  return {
    data: data.map(d => ({ ...d, paymentAmount: Number(d.paymentAmount || 0) })),
    total: totalCountResult?.count || 0,
    page,
    pageSize,
  };
}

/**
 * Returns attendance matrix per group:
 * For each group: members as rows, schedule dates as columns.
 */
export async function getAttendanceMatrixByGroup(
  startDate: string,
  endDate: string,
  groupId?: string
) {
  const scheduleConditions = [
    gte(workSchedules.workDate, startDate),
    lte(workSchedules.workDate, endDate),
    ne(workSchedules.status, "cancelled"),
  ];

  let scheduleList = await db
    .select({ id: workSchedules.id, workDate: workSchedules.workDate })
    .from(workSchedules)
    .where(and(...scheduleConditions))
    .orderBy(workSchedules.workDate);

  if (groupId) {
    const sgFilter = await db
      .select({ scheduleId: scheduleGroups.scheduleId })
      .from(scheduleGroups)
      .where(eq(scheduleGroups.groupId, groupId));
    const allowedIds = new Set(sgFilter.map((r) => r.scheduleId));
    scheduleList = scheduleList.filter((s) => allowedIds.has(s.id));
  }

  if (scheduleList.length === 0) return [];

  const scheduleIds = scheduleList.map((s) => s.id);

  const sgRows = await db
    .select({ groupId: scheduleGroups.groupId, scheduleId: scheduleGroups.scheduleId })
    .from(scheduleGroups)
    .innerJoin(groups, eq(groups.id, scheduleGroups.groupId))
    .where(
      and(
        inArray(scheduleGroups.scheduleId, scheduleIds),
        groupId ? eq(scheduleGroups.groupId, groupId) : undefined
      )
    );

  const groupIds = [...new Set(sgRows.map((r) => r.groupId))];
  if (groupIds.length === 0) return [];

  const groupRows = await db
    .select({ id: groups.id, name: groups.name, sequenceNo: groups.sequenceNo })
    .from(groups)
    .where(inArray(groups.id, groupIds))
    .orderBy(groups.sequenceNo);

  const attRows = await db
    .select({
      id: attendances.id,
      scheduleId: attendances.scheduleId,
      residentId: attendances.residentId,
      residentName: residents.name,
      groupId: attendances.groupId,
      status: attendances.status,
      notes: attendances.notes,
    })
    .from(attendances)
    .innerJoin(residents, eq(residents.id, attendances.residentId))
    .where(
      and(
        inArray(attendances.scheduleId, scheduleIds),
        groupId ? eq(attendances.groupId, groupId) : undefined
      )
    )
    .orderBy(residents.name);

  const scheduleIdToDate = Object.fromEntries(scheduleList.map((s) => [s.id, s.workDate]));

  return groupRows.map((group) => {
    const groupScheduleIds = sgRows
      .filter((r) => r.groupId === group.id)
      .map((r) => r.scheduleId);

    const dates = groupScheduleIds
      .map((sid) => scheduleIdToDate[sid])
      .filter(Boolean)
      .sort();

    const groupAttRows = attRows.filter((a) => a.groupId === group.id);
    const memberMap = new Map<string, { name: string; id: string }>();
    for (const a of groupAttRows) {
      if (!memberMap.has(a.residentId)) {
        memberMap.set(a.residentId, { name: a.residentName, id: a.residentId });
      }
    }
    const members = [...memberMap.values()].sort((a, b) => a.name.localeCompare(b.name));

    const matrix: Record<string, Record<string, string>> = {};
    const attendanceIds: Record<string, Record<string, string>> = {};
    const scheduleIds2: Record<string, string> = {}; // date -> scheduleId

    for (const a of groupAttRows) {
      const date = scheduleIdToDate[a.scheduleId];
      if (!date) continue;
      if (!matrix[a.residentId]) matrix[a.residentId] = {};
      if (!attendanceIds[a.residentId]) attendanceIds[a.residentId] = {};
      matrix[a.residentId][date] = a.status;
      attendanceIds[a.residentId][date] = a.id;
      scheduleIds2[date] = a.scheduleId;
    }

    return { group, dates, members, matrix, attendanceIds, scheduleIds: scheduleIds2 };
  });
}


