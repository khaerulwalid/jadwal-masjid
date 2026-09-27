import GroupForm from "@/components/groups/group-form";
import { GroupService } from "@/services/group.service";
import { notFound } from "next/navigation";

export default async function EditKelompokPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const group = await GroupService.getGroupById(params.id);

  if (!group) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Kelompok</h1>
        <p className="text-sm text-gray-600 mt-1">Ubah nama atau urutan kelompok.</p>
      </div>

      <GroupForm group={group} />
    </div>
  );
}
