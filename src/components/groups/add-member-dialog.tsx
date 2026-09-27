"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignResidentToGroupAction } from "@/actions/group.actions";

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
  const [selectedId, setSelectedId] = useState("");

  const filtered = availableResidents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.phone && r.phone.includes(search))
  );

  const handleSave = () => {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await assignResidentToGroupAction(groupId, selectedId);
      if (result.success) {
        setIsOpen(false);
        setSearch("");
        setSelectedId("");
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
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-md text-sm"
      >
        Tambah Anggota
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isPending && setIsOpen(false)} aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                  Tambah Anggota Kelompok
                </h3>
                
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Cari masyarakat (nama/HP)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Tidak ada masyarakat aktif yang tersedia atau cocok dengan pencarian.
                    </p>
                  ) : (
                    filtered.map((resident) => (
                      <label
                        key={resident.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer border ${
                          selectedId === resident.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resident"
                          value={resident.id}
                          checked={selectedId === resident.id}
                          onChange={() => setSelectedId(resident.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                          <p className="text-xs text-gray-500">{resident.phone || "Tidak ada no HP"}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !selectedId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Tambahkan"}
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
    </>
  );
}
