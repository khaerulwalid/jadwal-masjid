import ResidentForm from "@/components/residents/resident-form";
import { ResidentService } from "@/services/resident.service";
import { notFound } from "next/navigation";

export default async function EditMasyarakatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const resident = await ResidentService.getResidentById(params.id);

  if (!resident) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Masyarakat</h1>
        <p className="text-sm text-gray-600 mt-1">Ubah data profil masyarakat.</p>
      </div>

      <ResidentForm resident={resident} />
    </div>
  );
}
