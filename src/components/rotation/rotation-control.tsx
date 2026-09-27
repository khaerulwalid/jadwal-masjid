"use client";

import { useTransition, useState } from "react";
import { pauseRotationAction, resumeRotationAction } from "@/actions/rotation.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function RotationControl({
  isPaused,
  hasValidPointer,
  activeGroups,
}: {
  isPaused: boolean;
  hasValidPointer: boolean;
  activeGroups: { id: string; name: string; sequenceNo: number }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const [overrideGroupId, setOverrideGroupId] = useState("");

  const handlePause = () => {
    setIsPauseConfirmOpen(true);
  };

  const handlePauseConfirm = () => {
    startTransition(async () => {
      const result = await pauseRotationAction();
      if (result.success) {
        setIsPauseConfirmOpen(false);
      }
      alert(result.message);
    });
  };

  const handleResumeDirect = () => {
    startTransition(async () => {
      const result = await resumeRotationAction();
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    });
  };

  const handleResumeOverrideSave = () => {
    if (!overrideGroupId) {
      alert("Pilih kelompok terlebih dahulu.");
      return;
    }
    
    startTransition(async () => {
      const result = await resumeRotationAction(overrideGroupId);
      if (result.success) {
        setIsResumeDialogOpen(false);
        alert(result.message);
      } else {
        alert(result.message);
      }
    });
  };

  if (isPaused) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={() => {
            if (hasValidPointer) {
              handleResumeDirect();
            } else {
              setIsResumeDialogOpen(true);
            }
          }}
          disabled={isPending}
          className="btn-primary py-2 px-4 text-sm disabled:opacity-50 text-center"
        >
          {isPending ? "Memproses..." : "Lanjutkan Rotasi"}
        </button>
        
        {hasValidPointer && (
          <button
            onClick={() => {
              setOverrideGroupId("");
              setIsResumeDialogOpen(true);
            }}
            disabled={isPending}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 text-center"
          >
            Lanjut &amp; Ubah Kelompok
          </button>
        )}

        {isResumeDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    Lanjutkan &amp; Ubah Kelompok Awal
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Pilih dari kelompok mana jadwal rotasi akan dilanjutkan.</p>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {activeGroups.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Tidak ada kelompok aktif.
                      </p>
                    ) : (
                      activeGroups.map((group) => (
                        <label
                          key={group.id}
                          className={`flex items-center p-3 rounded-md cursor-pointer border ${
                            overrideGroupId === group.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"
                          }`}
                        >
                          <input
                            type="radio"
                            name="group"
                            value={group.id}
                            checked={overrideGroupId === group.id}
                            onChange={() => setOverrideGroupId(group.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900">{group.sequenceNo}. {group.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleResumeOverrideSave}
                    disabled={isPending || !overrideGroupId}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isPending ? "Menyimpan..." : "Lanjutkan Rotasi"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResumeDialogOpen(false)}
                    disabled={isPending}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If active
  return (
    <div className="mt-4">
      <button
        onClick={handlePause}
        disabled={isPending}
        className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold py-2 px-4 rounded-md text-sm disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Jeda Rotasi"}
      </button>
      <ConfirmDialog
        isOpen={isPauseConfirmOpen}
        title="Jeda rotasi?"
        description="Posisi kelompok berikutnya tetap disimpan dan dapat dilanjutkan kembali nanti."
        confirmText="Jeda Rotasi"
        isPending={isPending}
        onConfirm={handlePauseConfirm}
        onCancel={() => setIsPauseConfirmOpen(false)}
      />
    </div>
  );
}
