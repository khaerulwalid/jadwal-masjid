import { requireAdmin } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workSchedules, attendances, groups, residents, scheduleGroups } from "@/db/schema";
import { eq, and, ne, sql, desc, gte, lte } from "drizzle-orm";
import { formatDisplayDate } from "@/lib/date";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") || "completed";
    const groupId = searchParams.get("groupId");

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

    // We will export all attendances for the filtered schedules
    const data = await db.select({
      workDate: workSchedules.workDate,
      scheduleStatus: workSchedules.status,
      groupName: groups.name,
      residentName: residents.name,
      attendanceStatus: attendances.status,
      paymentAmount: attendances.paymentAmount,
      paymentDate: attendances.paymentDate,
      notes: attendances.notes,
    })
    .from(attendances)
    .innerJoin(workSchedules, eq(attendances.scheduleId, workSchedules.id))
    .innerJoin(residents, eq(attendances.residentId, residents.id))
    .innerJoin(groups, eq(attendances.groupId, groups.id))
    .where(whereClause)
    .orderBy(desc(workSchedules.workDate), groups.sequenceNo, residents.name);

    // CSV Escaping & Formatting
    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return "";
      
      let escaped = String(str);
      
      // Formula injection protection
      if (escaped.match(/^[=\+\-@]/)) {
        escaped = "'" + escaped;
      }

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")) {
        escaped = `"${escaped.replace(/"/g, '""')}"`;
      }
      return escaped;
    };

    const statusMap: Record<string, string> = {
      'present': 'Hadir',
      'paid': 'Bayar',
      'absent': 'Tidak Hadir',
      'pending': 'Belum Dicatat',
      'scheduled': 'Terjadwal',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
    };

    const headers = [
      "Tanggal Kegiatan",
      "Status Jadwal",
      "Kelompok",
      "Nama Masyarakat",
      "Status Kehadiran",
      "Nominal Pengganti",
      "Tanggal Bayar",
      "Catatan"
    ];

    let csvContent = headers.join(",") + "\n";

    data.forEach((row) => {
      const csvRow = [
        escapeCsv(formatDisplayDate(row.workDate)),
        escapeCsv(statusMap[row.scheduleStatus] || row.scheduleStatus),
        escapeCsv(row.groupName),
        escapeCsv(row.residentName),
        escapeCsv(statusMap[row.attendanceStatus] || row.attendanceStatus),
        escapeCsv(row.paymentAmount ? Number(row.paymentAmount).toString() : "0"),
        escapeCsv(row.paymentDate ? formatDisplayDate(row.paymentDate) : ""),
        escapeCsv(row.notes),
      ];
      csvContent += csvRow.join(",") + "\n";
    });

    // Add UTF-8 BOM
    const bom = "\uFEFF";
    const finalContent = bom + csvContent;

    return new NextResponse(finalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-gotong-royong.csv"`,
      },
    });

  } catch (error) {
    console.error("CSV Export error:", error);
    return new NextResponse("Gagal mengekspor data", { status: 500 });
  }
}
