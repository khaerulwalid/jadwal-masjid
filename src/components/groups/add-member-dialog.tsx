"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkAssignResidentsToGroupAction } from "@/actions/group.actions";
import { UserPlus, X, Search, Loader2, CheckSquare, Square } from "lucide-react";

export default function AddMemberDialog({
  groupId,
  availableResidents,
}: {
  groupId: string;
  availableResidents: { id: string; name: string; phone: string | null }[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = availableResidents.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone && r.phone.includes(search))
  );

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleSave = () => {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const result = await bulkAssignResidentsToGroupAction(groupId, [...selectedIds]);
      if (result.success) {
        setIsOpen(false);
        setSearch("");
        setSelectedIds(new Set());
        router.refresh();
        if (result.message) alert(result.message);
      } else {
        alert(result.message);
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    setSearch("");
    setSelectedIds(new Set());
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.875rem", borderRadius: "0.375rem", border: "none", background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
      >
        <UserPlus style={{ width: 15, height: 15 }} />
        Tambah Anggota
      </button>

      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)" }} onClick={handleClose} />

          {/* Dialog */}
          <div style={{
            position: "relative", zIndex: 10, backgroundColor: "#fff",
            borderRadius: "0.875rem", boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            width: "100%", maxWidth: "520px", margin: "1rem", overflow: "hidden",
            border: "1px solid #d1fae5", display: "flex", flexDirection: "column", maxHeight: "90vh",
          }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #047857, #065f46)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserPlus style={{ color: "#fff", width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Tambah Anggota Kelompok</h3>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", margin: "0.15rem 0 0" }}>
                    {availableResidents.length} masyarakat tersedia
                  </p>
                </div>
              </div>
              <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #94a3b8", borderRadius: "0.5rem", overflow: "hidden", backgroundColor: "#fff" }}>
                <span style={{ padding: "0 0.75rem", color: "#94a3b8" }}><Search style={{ width: 16, height: 16 }} /></span>
                <input
                  type="text"
                  placeholder="Cari nama atau nomor HP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, border: "none", outline: "none", padding: "0.5rem 0.5rem 0.5rem 0", fontSize: "0.875rem", color: "#0f172a", backgroundColor: "#fff" }}
                />
              </div>

              {/* Select All */}
              {filtered.length > 0 && (
                <button
                  onClick={toggleAll}
                  style={{ marginTop: "0.625rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#047857", fontWeight: 600, padding: 0 }}
                >
                  {allFilteredSelected
                    ? <CheckSquare style={{ width: 16, height: 16, color: "#047857" }} />
                    : <Square style={{ width: 16, height: 16, color: "#94a3b8" }} />}
                  {allFilteredSelected ? "Batal Pilih Semua" : `Pilih Semua (${filtered.length})`}
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0.5rem 0.75rem" }}>
              {filtered.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem 0", fontSize: "0.875rem" }}>
                  Tidak ada masyarakat yang tersedia atau cocok dengan pencarian.
                </p>
              ) : (
                filtered.map((resident) => {
                  const isChecked = selectedIds.has(resident.id);
                  return (
                    <label
                      key={resident.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
                        cursor: "pointer", marginBottom: "0.25rem",
                        backgroundColor: isChecked ? "#f0fdf4" : "#fff",
                        border: `1.5px solid ${isChecked ? "#6ee7b7" : "transparent"}`,
                        transition: "all 150ms ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(resident.id)}
                        style={{ width: 16, height: 16, accentColor: "#047857", cursor: "pointer", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{resident.name}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>{resident.phone || "Tidak ada no HP"}</p>
                      </div>
                      {isChecked && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#047857", backgroundColor: "#dcfce7", padding: "0.1rem 0.5rem", borderRadius: "9999px" }}>
                          ✓ Dipilih
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "1rem 1.5rem", backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 500 }}>
                {selectedIds.size > 0
                  ? <span style={{ color: "#047857", fontWeight: 700 }}>{selectedIds.size} dipilih</span>
                  : "Belum ada yang dipilih"}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={handleClose} disabled={isPending} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1.5px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || selectedIds.size === 0}
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "none", background: selectedIds.size === 0 ? "#e2e8f0" : "linear-gradient(135deg, #059669, #047857)", color: selectedIds.size === 0 ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: isPending || selectedIds.size === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem", opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? (
                    <><Loader2 style={{ width: 15, height: 15 }} />Menyimpan...</>
                  ) : (
                    `Tambahkan${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
