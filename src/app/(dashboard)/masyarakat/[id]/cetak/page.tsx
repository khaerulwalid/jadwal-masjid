import { ResidentService } from "@/services/resident.service";
import { GroupService } from "@/services/group.service";
import { validateSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { formatDisplayDate } from "@/lib/date";
import { formatIDR } from "@/lib/money";
import PrintButton from "@/components/ui/print-button";

function statusBadge(s: string) {
  if (s === "present")  return { label: "✓ Hadir",       bg: "#dcfce7", color: "#166534" };
  if (s === "paid")     return { label: "$ Bayar",        bg: "#cffafe", color: "#0e7490" };
  if (s === "absent")   return { label: "✗ Tidak Hadir",  bg: "#fee2e2", color: "#991b1b" };
  return                       { label: "– Pending",      bg: "#f1f5f9", color: "#64748b" };
}

export default async function CetakMasyarakatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await validateSession();
  if (!session) redirect("/login");

  const resident = await ResidentService.getResidentById(params.id);
  if (!resident) notFound();

  const [activeGroup, history, summary, allAttendance] = await Promise.all([
    GroupService.getResidentActiveGroup(resident.id),
    GroupService.getResidentMembershipHistory(resident.id),
    ResidentService.getResidentAttendanceSummary(resident.id),
    ResidentService.getResidentAttendanceHistoryAll(resident.id),
  ]);

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar",
  });

  const attendanceRate = summary.scheduled > 0
    ? Math.round(((summary.present + summary.paid) / summary.scheduled) * 100)
    : 0;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }} className="print:bg-white">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <a href={`/masyarakat/${resident.id}`} className="text-sm text-slate-500 hover:text-emerald-700 font-medium">← Kembali ke Detail</a>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-semibold text-slate-800">{resident.name}</span>
        </div>
        <PrintButton />
      </div>

      {/* Print content */}
      <div className="max-w-5xl mx-auto px-6 py-8 print:px-0 print:py-0 print:max-w-none">

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #065f46, #047857)", borderRadius: "0.75rem", padding: "1.5rem 2rem", marginBottom: "1.5rem", color: "#fff" }}
             className="print:rounded-none print:mx-0">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Kartu Riwayat Gotong Royong</p>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.25rem" }}>{resident.name}</h1>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                Kelompok: {activeGroup ? activeGroup.groupName : "Belum ada kelompok"}
              </p>
              {resident.address && (
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", margin: "0.25rem 0 0" }}>📍 {resident.address}</p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0 0 0.25rem" }}>Dicetak pada</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{printDate}</p>
              <span style={{ marginTop: "0.5rem", display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: resident.isActive ? "#a7f3d0" : "#fca5a5", color: resident.isActive ? "#065f46" : "#991b1b" }}>
                {resident.isActive ? "✓ Aktif" : "✗ Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Jadwal", value: summary.scheduled, bg: "#f1f5f9", color: "#0f172a" },
            { label: "✓ Hadir",      value: summary.present,   bg: "#dcfce7", color: "#166534" },
            { label: "$ Bayar",      value: summary.paid,      bg: "#cffafe", color: "#0e7490" },
            { label: "✗ Tdk Hadir",  value: summary.absent,    bg: "#fee2e2", color: "#991b1b" },
            { label: "Kehadiran",    value: `${attendanceRate}%`, bg: attendanceRate >= 80 ? "#dcfce7" : attendanceRate >= 60 ? "#fef9c3" : "#fee2e2", color: attendanceRate >= 80 ? "#166534" : attendanceRate >= 60 ? "#854d0e" : "#991b1b" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: "0.5rem", padding: "0.875rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.7rem", color: s.color, fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>{s.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Attendance table */}
        <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "1.5rem" }}
             className="print:rounded-none print:border-0">
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(90deg, #f0fdf4, #f8fafc)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#065f46", margin: 0 }}>Riwayat Kehadiran Lengkap</h2>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0" }}>{allAttendance.length} data kehadiran tercatat</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["No", "Tanggal", "Kelompok", "Status Jadwal", "Kehadiran", "Uang Pengganti", "Catatan"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.75rem", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Belum ada data kehadiran.</td>
                </tr>
              ) : allAttendance.map((att, idx) => {
                const badge = statusBadge(att.attendanceStatus);
                const rowBg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
                return (
                  <tr key={att.scheduleId} style={{ backgroundColor: rowBg }}>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#94a3b8", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{idx + 1}</td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9" }}>{formatDisplayDate(att.workDate)}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#334155", borderBottom: "1px solid #f1f5f9" }}>{att.groupName}</td>
                    <td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600,
                        backgroundColor: att.status === "completed" ? "#dcfce7" : att.status === "scheduled" ? "#cffafe" : "#fee2e2",
                        color: att.status === "completed" ? "#166534" : att.status === "scheduled" ? "#0e7490" : "#991b1b" }}>
                        {att.status === "completed" ? "Selesai" : att.status === "scheduled" ? "Terjadwal" : "Dibatalkan"}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ padding: "0.2rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: att.attendanceStatus === "paid" ? "#0e7490" : "#94a3b8", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>
                      {att.attendanceStatus === "paid" ? formatIDR(Number(att.paymentAmount)) : "–"}
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "#64748b", fontSize: "0.75rem", borderBottom: "1px solid #f1f5f9", maxWidth: "200px" }}>
                      {att.notes || "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", marginTop: "1rem" }} className="print:block hidden">
          Dicetak pada {printDate} — Sistem Jadwal Gotong Royong Masjid
        </div>
      </div>
    </div>
  );
}
