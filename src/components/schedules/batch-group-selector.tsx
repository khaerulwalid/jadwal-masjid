import { RotationGroup } from "@/lib/rotation";

export default function BatchGroupSelector({
  activeGroups,
}: {
  activeGroups: RotationGroup[];
}) {
  if (activeGroups.length === 0) {
    return <div className="text-sm text-red-500">Tidak ada kelompok aktif untuk rotasi otomatis.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startGroupId" className="block text-sm font-medium text-gray-700 mb-1">
          Mulai dari Kelompok <span className="text-red-500">*</span>
        </label>
        <select
          id="startGroupId"
          name="startGroupId"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          {activeGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.sequenceNo}. {g.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Sistem akan membuat jadwal harian berurutan mulai dari kelompok yang dipilih hingga semua kelompok terjadwal satu putaran.
        </p>
      </div>

      <div>
        <label htmlFor="groupsPerDay" className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Kelompok Per Hari <span className="text-red-500">*</span>
        </label>
        <select
          id="groupsPerDay"
          name="groupsPerDay"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          defaultValue="1"
        >
          <option value="1">1 Kelompok Per Hari</option>
          <option value="2">2 Kelompok Per Hari</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Tentukan pola jadwal. Misalnya 2 kelompok per hari akan menyelesaikan rotasi dua kali lebih cepat.
        </p>
      </div>
    </div>
  );
}
