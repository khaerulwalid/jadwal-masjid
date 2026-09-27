import GroupForm from "@/components/groups/group-form";
import { GroupService } from "@/services/group.service";

export default async function TambahKelompokPage() {
  // Suggest sequenceNo = MAX + 1
  const groups = await GroupService.getGroups();
  const maxSeq = groups.reduce((max, g) => Math.max(max, g.sequenceNo), 0);
  const suggestedSequence = maxSeq + 1;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Kelompok</h1>
        <p className="text-sm text-gray-600 mt-1">Masukkan kelompok baru untuk dijadwalkan.</p>
      </div>

      <GroupForm suggestedSequence={suggestedSequence} />
    </div>
  );
}
