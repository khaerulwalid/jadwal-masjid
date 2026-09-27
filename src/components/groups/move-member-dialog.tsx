"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveResidentToGroupAction } from "@/actions/group.actions";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function MoveMemberDialog({
  residentId,
  residentName,
  currentGroupId,
  availableGroups,
}: {
  residentId: string;
  residentName: string;
  currentGroupId: string;
  availableGroups: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const handleSave = () => {
    if (!selectedGroupId) return;
    
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await moveResidentToGroupAction(residentId, selectedGroupId, currentGroupId);
      if (result.success) {
        setIsConfirmOpen(false);
        setIsOpen(false);
        setSelectedGroupId("");
        router.refresh();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-3"
      >
        Pindahkan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-emerald-950/55 backdrop-blur-sm transition-opacity" onClick={() => !isPending && setIsOpen(false)} aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  Pindahkan Masyarakat
                </h3>
                <p className="text-sm text-gray-500 mb-4">Pilih kelompok tujuan untuk memindahkan <strong>{residentName}</strong>.</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {availableGroups.filter(g => g.id !== currentGroupId).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Tidak ada kelompok aktif lainnya.
                    </p>
                  ) : (
                    availableGroups.filter(g => g.id !== currentGroupId).map((group) => (
                      <label
                        key={group.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer border ${
                          selectedGroupId === group.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="group"
                          value={group.id}
                          checked={selectedGroupId === group.id}
                          onChange={() => setSelectedGroupId(group.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                        />
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !selectedGroupId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Pindahkan"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={`Pindahkan ${residentName}?`}
        description={`${residentName} akan dipindahkan ke ${availableGroups.find((g) => g.id === selectedGroupId)?.name || "kelompok tujuan"}. Histori kelompok lama tetap disimpan.`}
        confirmText="Pindahkan"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
