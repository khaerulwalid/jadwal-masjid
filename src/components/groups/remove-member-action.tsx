"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeResidentFromGroupAction } from "@/actions/group.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function RemoveMemberAction({
  residentId,
  groupId,
  residentName,
}: {
  residentId: string;
  groupId: string;
  residentName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRemove = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await removeResidentFromGroupAction(residentId, groupId);
      if (result.success) {
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="text-red-700 hover:text-red-900 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Keluarkan"}
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={`Keluarkan ${residentName}?`}
        description="Masyarakat akan dikeluarkan dari kelompok aktif. Histori keanggotaan tetap disimpan."
        confirmText="Keluarkan"
        variant="danger"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
