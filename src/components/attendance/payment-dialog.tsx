"use client";

import { useState, useTransition } from "react";
import { updateAttendanceAction } from "@/actions/attendance.actions";
import { Wallet, X, Loader2 } from "lucide-react";

export default function PaymentDialog({
  attendanceId,
  scheduleId,
  residentName,
  defaultAmount,
  onClose,
  initialAmount = null,
  initialDate = null,
  initialNotes = "",
}: {
  attendanceId: string;
  scheduleId: string;
  residentName: string;
  defaultAmount: number;
  onClose: () => void;
  initialAmount?: number | null;
  initialDate?: string | null;
  initialNotes?: string | null;
}) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" });

  const [amount, setAmount] = useState<string>(
    initialAmount ? initialAmount.toString() : defaultAmount.toString()
  );
  const [date, setDate] = useState<string>(initialDate || today);
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Nominal pembayaran harus lebih dari Rp0.");
      return;
    }
    if (!date) {
      alert("Tanggal pembayaran wajib diisi.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("attendanceId", attendanceId);
      formData.append("status", "paid");
      formData.append("paymentAmount", numAmount.toString());
      formData.append("paymentDate", date);
      if (notes) formData.append("notes", notes);

      const result = await updateAttendanceAction(scheduleId, formData);
      if (result.success) {
        onClose();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    /* Overlay */
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        onClick={!isPending ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          backgroundColor: "#ffffff",
          borderRadius: "0.875rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: "480px",
          margin: "1rem",
          overflow: "hidden",
          border: "1px solid #d1fae5",
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #047857, #065f46)", padding: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet style={{ color: "#ffffff", width: "20px", height: "20px" }} />
            </div>
            <div>
              <h3 style={{ color: "#ffffff", fontSize: "1.125rem", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                Bayar Pengganti Kerja
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem", margin: "0.2rem 0 0 0" }}>
                {residentName}
              </p>
            </div>
          </div>
          <button
            onClick={!isPending ? onClose : undefined}
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff" }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Nominal */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.375rem" }}>
              Nominal Pembayaran <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #94a3b8", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "#ffffff" }}>
              <span style={{ padding: "0.625rem 0.875rem", backgroundColor: "#f1f5f9", borderRight: "1.5px solid #94a3b8", color: "#475569", fontWeight: 600, fontSize: "0.875rem", flexShrink: 0 }}>Rp</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", padding: "0.625rem 0.75rem", fontSize: "0.9375rem", fontWeight: 600, color: "#0f172a", backgroundColor: "#ffffff" }}
              />
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.375rem" }}>
              Tanggal Bayar <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #94a3b8", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#0f172a", backgroundColor: "#ffffff", boxSizing: "border-box" }}
            />
          </div>

          {/* Catatan */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.375rem" }}>
              Catatan <span style={{ color: "#64748b", fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Bayar melalui bendahara"
              maxLength={1000}
              style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #94a3b8", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#0f172a", backgroundColor: "#ffffff", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{ padding: "0.625rem 1.25rem", borderRadius: "0.5rem", border: "1.5px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            style={{ padding: "0.625rem 1.5rem", borderRadius: "0.5rem", border: "none", background: "linear-gradient(135deg, #059669, #047857)", color: "#ffffff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1, display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            {isPending ? (
              <>
                <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                Menyimpan...
              </>
            ) : (
              "Simpan Pembayaran"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
