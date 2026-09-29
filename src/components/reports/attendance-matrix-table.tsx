"use client";

import { useState, useTransition } from "react";
import { updateAttendanceAction } from "@/actions/attendance.actions";
import { X, Loader2 } from "lucide-react";

type MatrixEntry = {
  group: { id: string; name: string; sequenceNo: number };
  dates: string[];
  members: { id: string; name: string }[];
  matrix: Record<string, Record<string, string>>;
  attendanceIds: Record<string, Record<string, string>>;
  scheduleIds: Record<string, string>; // date -> scheduleId
};

function shortDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDate();
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  return `${day}/${months[d.getUTCMonth()]}`;
}

function AbsenceDialog({
  memberName,
  attendanceId,
  scheduleId,
  currentNote,
  onClose,
}: {
  memberName: string;
  attendanceId: string;
  scheduleId: string;
  currentNote: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState(currentNote);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("attendanceId", attendanceId);
      formData.append("status", "absent");
      if (note.trim()) formData.append("notes", note.trim());

      const result = await updateAttendanceAction(scheduleId, formData);
      if (result.success) {
        onClose();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)" }} onClick={!isPending ? onClose : undefined} />
      <div style={{ position: "relative", zIndex: 10, backgroundColor: "#fff", borderRadius: "0.875rem", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", width: "100%", maxWidth: "420px", margin: "1rem", overflow: "hidden", border: "1px solid #fecaca" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Alasan Tidak Hadir</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>{memberName}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
            Keterangan <span style={{ color: "#64748b", fontWeight: 400 }}>(opsional)</span>
          </label>
          <textarea
            autoFocus
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Sakit, ada keperluan keluarga, dsb."
            maxLength={500}
            style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #94a3b8", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#0f172a", backgroundColor: "#fff", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} disabled={isPending} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1.5px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
            Batal
          </button>
          <button type="button" onClick={handleSave} disabled={isPending} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isPending ? <><Loader2 style={{ width: 15, height: 15 }} /> Menyimpan...</> : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AttendanceMatrixTable({ data }: { data: MatrixEntry[] }) {
  const [dialog, setDialog] = useState<{
    memberName: string;
    attendanceId: string;
    scheduleId: string;
    currentNote: string;
  } | null>(null);

  if (data.length === 0) {
    return (
      <div className="text-center text-slate-500 py-16 bg-white rounded-lg border border-slate-200">
        Tidak ada data kehadiran untuk periode yang dipilih.
      </div>
    );
  }

  return (
    <>
      {dialog && (
        <AbsenceDialog
          memberName={dialog.memberName}
          attendanceId={dialog.attendanceId}
          scheduleId={dialog.scheduleId}
          currentNote={dialog.currentNote}
          onClose={() => setDialog(null)}
        />
      )}

      <div className="space-y-8">
        {data.map(({ group, dates, members, matrix, attendanceIds, scheduleIds }) => {
          return (
            <div key={group.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid print:mb-6">
              {/* Group Header */}
              <div className="px-4 py-2.5 border-b border-slate-200 flex items-center gap-2" style={{ background: "linear-gradient(90deg, #f0fdf4, #ecfdf5)" }}>
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-xs">{group.sequenceNo}</span>
                <h3 className="font-bold text-base text-emerald-900">{group.name}</h3>
                <span className="ml-auto text-xs text-slate-500">{members.length} anggota · {dates.length} jadwal</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-slate-50 border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[160px] text-xs">
                        Nama Anggota
                      </th>
                      {dates.map((date) => (
                        <th key={date} className="border border-slate-200 px-1.5 py-1 text-center font-semibold text-slate-700 min-w-[44px] text-xs">
                          {shortDate(date)}
                        </th>
                      ))}
                      <th className="border border-slate-200 px-2 py-1 text-center font-semibold text-slate-700 bg-slate-50 text-xs whitespace-nowrap">Rekap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => {
                      const row = matrix[member.id] || {};
                      const present = Object.values(row).filter(s => s === "present").length;
                      const paid    = Object.values(row).filter(s => s === "paid").length;
                      const absent  = Object.values(row).filter(s => s === "absent").length;
                      const rowBg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";

                      return (
                        <tr key={member.id}>
                          <td className="sticky left-0 z-10 border border-slate-200 px-3 py-1.5 font-medium text-slate-800 whitespace-nowrap text-xs"
                              style={{ backgroundColor: rowBg }}>
                            {idx + 1}. {member.name}
                          </td>
                          {dates.map((date) => {
                            const status = row[date];
                            const attId = attendanceIds[member.id]?.[date];
                            const schId = scheduleIds[date];

                            if (!status || !attId) {
                              return (
                                <td key={date} className="border border-slate-200 text-center py-1.5 text-slate-200 text-xs">·</td>
                              );
                            }

                            if (status === "present") {
                              return (
                                <td key={date} className="border border-slate-200 text-center py-1">
                                  <span className="text-emerald-700 font-black text-sm">✓</span>
                                </td>
                              );
                            }

                            if (status === "paid") {
                              return (
                                <td key={date} className="border border-slate-200 text-center py-1">
                                  <span className="text-cyan-700 font-black text-sm">$</span>
                                </td>
                              );
                            }

                            if (status === "absent") {
                              return (
                                <td key={date} className="border border-slate-200 text-center py-1 print:cursor-default">
                                  <button
                                    className="print:hidden text-red-600 font-black text-sm hover:bg-red-50 rounded w-full px-1"
                                    onClick={() => setDialog({
                                      memberName: member.name,
                                      attendanceId: attId,
                                      scheduleId: schId,
                                      currentNote: "",
                                    })}
                                  >
                                    ✗
                                  </button>
                                  <span className="hidden print:inline text-red-600 font-black text-sm">✗</span>
                                </td>
                              );
                            }

                            // pending
                            return (
                              <td key={date} className="border border-slate-200 text-center py-1 text-slate-300 text-xs">–</td>
                            );
                          })}
                          <td className="border border-slate-200 text-center px-1.5 py-1 text-xs whitespace-nowrap">
                            <span className="inline-flex gap-1">
                              {present > 0 && <span className="text-emerald-700 font-bold">✓{present}</span>}
                              {paid > 0    && <span className="text-cyan-700 font-bold">${paid}</span>}
                              {absent > 0  && <span className="text-red-600 font-bold">✗{absent}</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary row */}
                    <tr className="bg-slate-100 border-t-2 border-slate-300 text-xs font-semibold">
                      <td className="sticky left-0 z-10 border border-slate-300 px-3 py-1.5 bg-slate-100 text-slate-600">Rekap</td>
                      {dates.map((date) => {
                        let p = 0, u = 0, a = 0;
                        for (const member of members) {
                          const s = matrix[member.id]?.[date];
                          if (s === "present") p++;
                          else if (s === "paid") u++;
                          else if (s === "absent") a++;
                        }
                        return (
                          <td key={date} className="border border-slate-300 text-center py-1 px-0.5">
                            <div className="flex flex-col items-center leading-tight">
                              {p > 0 && <span className="text-emerald-700">✓{p}</span>}
                              {u > 0 && <span className="text-cyan-700">${u}</span>}
                              {a > 0 && <span className="text-red-600">✗{a}</span>}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border border-slate-300" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
