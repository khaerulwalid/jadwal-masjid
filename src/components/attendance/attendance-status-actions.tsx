"use client";

import { useState, useTransition } from "react";
import { updateAttendanceAction } from "@/actions/attendance.actions";
import PaymentDialog from "./payment-dialog";
import { X, Loader2 } from "lucide-react";

// ── Absence Dialog ──────────────────────────────────────────────────────────
function AbsenceDialog({
  residentName,
  attendanceId,
  scheduleId,
  onClose,
}: {
  residentName: string;
  attendanceId: string;
  scheduleId: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
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
      <div style={{
        position: "relative", zIndex: 10, backgroundColor: "#fff",
        borderRadius: "0.875rem", boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        width: "100%", maxWidth: "420px", margin: "1rem", overflow: "hidden",
        border: "1px solid #fecaca",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Tidak Hadir</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>{residentName}</p>
          </div>
          <button onClick={!isPending ? onClose : undefined} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
            Catatan / Alasan <span style={{ color: "#64748b", fontWeight: 400 }}>(opsional)</span>
          </label>
          <textarea
            autoFocus
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Sakit, ada keperluan, dsb."
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

// ── Main Component ──────────────────────────────────────────────────────────
export default function AttendanceStatusActions({
  attendanceId,
  scheduleId,
  residentName,
  currentStatus,
  defaultAmount,
  disabled = false,
}: {
  attendanceId: string;
  scheduleId: string;
  residentName: string;
  currentStatus: string;
  defaultAmount: number;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPayment, setShowPayment] = useState(false);
  const [showAbsence, setShowAbsence] = useState(false);

  const handlePresent = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("attendanceId", attendanceId);
      formData.append("status", "present");
      const result = await updateAttendanceAction(scheduleId, formData);
      if (!result.success) alert(result.message);
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePresent}
          disabled={isPending || disabled || currentStatus === "present"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "present"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          } disabled:opacity-50 transition-colors`}
        >
          Hadir
        </button>

        <button
          onClick={() => setShowPayment(true)}
          disabled={isPending || disabled || currentStatus === "paid"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "paid"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          } disabled:opacity-50 transition-colors`}
        >
          Bayar
        </button>

        <button
          onClick={() => setShowAbsence(true)}
          disabled={isPending || disabled || currentStatus === "absent"}
          className={`px-3 py-1 text-sm font-medium rounded-md border ${
            currentStatus === "absent"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
          } disabled:opacity-50 transition-colors`}
        >
          Tidak Hadir
        </button>
      </div>

      {showPayment && (
        <PaymentDialog
          attendanceId={attendanceId}
          scheduleId={scheduleId}
          residentName={residentName}
          defaultAmount={defaultAmount}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showAbsence && (
        <AbsenceDialog
          attendanceId={attendanceId}
          scheduleId={scheduleId}
          residentName={residentName}
          onClose={() => setShowAbsence(false)}
        />
      )}
    </>
  );
}
