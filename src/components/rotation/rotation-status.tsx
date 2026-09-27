import SetNextGroupDialog from "./set-next-group-dialog";
import RotationControl from "./rotation-control";

export default function RotationStatus({
  isPaused,
  nextGroup,
  activeGroups,
}: {
  isPaused: boolean;
  nextGroup: { id: string; name: string; sequenceNo: number } | null;
  activeGroups: { id: string; name: string; sequenceNo: number }[];
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Status Rotasi</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-2 text-sm text-gray-900">
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  !isPaused
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {!isPaused ? "Aktif" : "Dijeda"}
              </span>
              <p className="mt-2 text-gray-500 text-xs">
                {!isPaused
                  ? "Jadwal berikutnya akan menggunakan kelompok di bawah ini."
                  : "Jadwal otomatis/rotasi sedang dijeda. Posisi rotasi tetap disimpan."}
              </p>
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Kelompok Berikutnya</dt>
            <dd className="mt-2 text-sm text-gray-900">
              {nextGroup ? (
                <div>
                  <span className="font-bold text-lg">{nextGroup.name}</span>
                  <div className="mt-3">
                    <SetNextGroupDialog 
                      currentNextGroupId={nextGroup.id}
                      activeGroups={activeGroups}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span className="italic text-gray-400">Belum ditentukan</span>
                  <div className="mt-3">
                    <SetNextGroupDialog 
                      currentNextGroupId={null}
                      activeGroups={activeGroups}
                      buttonLabel="Tentukan Kelompok Awal"
                      buttonClassName="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-4 sm:px-6 bg-gray-50">
        <RotationControl 
          isPaused={isPaused} 
          hasValidPointer={nextGroup !== null} 
          activeGroups={activeGroups}
        />
      </div>
    </div>
  );
}
