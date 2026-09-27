"use client";

import { useState, useTransition } from "react";
import { setGroupActiveStatusAction } from "@/actions/group.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function GroupStatusAction({
  id,
  isActive,
  memberCount,
}: {
  id: string;
  isActive: boolean;
  memberCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleToggle = () => {
    if (isActive && memberCount > 0) {
      alert("Kelompok masih memiliki anggota aktif. Pindahkan atau keluarkan semua anggota terlebih dahulu.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await setGroupActiveStatusAction(id, !isActive);
      if (result.success) {
        setIsConfirmOpen(false);
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`text-sm font-semibold py-1 px-3 rounded-md border ${
          isActive
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        } disabled:opacity-50`}
      >
        {isPending ? "Memproses..." : isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={isActive ? "Nonaktifkan kelompok?" : "Aktifkan kelompok?"}
        description={
          isActive
            ? "Kelompok tidak akan dimasukkan ke jadwal rotasi baru. Data histori tetap disimpan."
            : "Kelompok akan tersedia kembali untuk rotasi gotong royong berikutnya."
        }
        confirmText={isActive ? "Nonaktifkan" : "Aktifkan"}
        variant={isActive ? "danger" : "default"}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
