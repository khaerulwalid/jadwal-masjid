import Link from "next/link";
import { GroupService } from "@/services/group.service";
import { notFound } from "next/navigation";
import GroupStatusAction from "@/components/groups/group-status-action";
import GroupMembers from "@/components/groups/group-members";
import AddMemberDialog from "@/components/groups/add-member-dialog";

export default async function DetailKelompokPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const group = await GroupService.getGroupById(params.id);

  if (!group) {
    notFound();
  }

  const members = await GroupService.getGroupMembers(group.id);
  
  // Data for dialogs
  const availableResidents = group.isActive ? await GroupService.getAvailableResidents() : [];
  const allGroups = group.isActive ? await GroupService.getGroups({ status: "active" }) : [];
  
  // Transform allGroups for Move dialog
  const availableGroups = allGroups.map(g => ({ id: g.id, name: g.name }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Kelompok</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/kelompok/${group.id}/edit`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md"
          >
            Edit
          </Link>
          <GroupStatusAction id={group.id} isActive={group.isActive} memberCount={members.length} />
          <Link
            href="/kelompok"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
          >
            Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{group.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Urutan Rotasi: {group.sequenceNo}</p>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              group.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {group.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Anggota Kelompok</h3>
            <p className="text-sm text-gray-500 mt-1">Total: {members.length} anggota aktif</p>
          </div>
          {group.isActive && (
            <AddMemberDialog 
              groupId={group.id} 
              availableResidents={availableResidents} 
            />
          )}
        </div>
        
        {!group.isActive && (
          <div className="bg-yellow-50 p-4 border-b border-yellow-200">
            <p className="text-sm text-yellow-700">
              Kelompok sedang nonaktif. Anda tidak dapat menambah, memindahkan, atau mengeluarkan anggota.
            </p>
          </div>
        )}

        <GroupMembers 
          groupId={group.id}
          groupIsActive={group.isActive}
          members={members} 
          availableGroups={availableGroups} 
        />
      </div>
    </div>
  );
}
