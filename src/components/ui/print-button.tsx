"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1.25rem",
        borderRadius: "0.5rem",
        border: "none",
        background: "linear-gradient(135deg, #059669, #047857)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "0.875rem",
        cursor: "pointer",
      }}
    >
      <Printer style={{ width: 16, height: 16 }} />
      Cetak PDF (Landscape)
    </button>
  );
}
