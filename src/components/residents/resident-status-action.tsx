"use client";

import { useState, useTransition } from "react";
import { setResidentActiveStatusAction } from "@/actions/resident.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function ResidentStatusAction({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleToggle = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await setResidentActiveStatusAction(id, !isActive);
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
        title={isActive ? "Nonaktifkan masyarakat?" : "Aktifkan masyarakat?"}
        description={
          isActive
            ? "Masyarakat yang nonaktif tidak akan dimasukkan ke jadwal gotong royong baru. Data histori tetap disimpan."
            : "Masyarakat akan tersedia kembali untuk kelompok dan jadwal gotong royong."
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
