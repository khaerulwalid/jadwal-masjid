import ResidentForm from "@/components/residents/resident-form";

export default function TambahMasyarakatPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Masyarakat</h1>
        <p className="text-sm text-gray-600 mt-1">Masukkan data masyarakat baru ke dalam sistem.</p>
      </div>

      <ResidentForm />
    </div>
  );
}
