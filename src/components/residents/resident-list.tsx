import Link from "next/link";
import ResidentStatusAction from "./resident-status-action";
import { ResidentService } from "@/services/resident.service";

export default async function ResidentList({
  search,
  status,
  page,
}: {
  search?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
}) {
  const data = await ResidentService.getResidents({ search, status, page });

  if (data.items.length === 0) {
    if (search) {
      return (
        <div className="app-card p-8 text-center text-slate-500">
          Tidak ada masyarakat yang cocok dengan pencarian &quot;{search}&quot;.
        </div>
      );
    }
    return (
      <div className="app-card p-8 text-center">
        <p className="text-slate-500 mb-4">Belum ada data masyarakat.</p>
        <p className="text-sm text-slate-400 mb-6">
          Tambahkan masyarakat pertama agar dapat dimasukkan ke kelompok gotong royong.
        </p>
        <Link
          href="/masyarakat/tambah"
          className="btn-primary py-2 px-4"
        >
          Tambah Masyarakat
        </Link>
      </div>
    );
  }

  return (
    <div className="app-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th scope="col">
                Nama
              </th>
              <th scope="col">
                Nomor HP
              </th>
              <th scope="col">
                Status
              </th>
              <th scope="col" className="text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.items.map((resident) => (
              <tr key={resident.id}>
                <td className="whitespace-nowrap text-sm font-semibold text-slate-950">
                  {resident.name}
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  {resident.phone || "-"}
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resident.isActive
                        ? "status-active"
                        : "status-danger"
                    }`}
                  >
                    {resident.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/masyarakat/${resident.id}`} className="link-primary">
                    Lihat
                  </Link>
                  <Link href={`/masyarakat/${resident.id}/edit`} className="text-slate-600 hover:text-slate-950">
                    Edit
                  </Link>
                  <ResidentStatusAction id={resident.id} isActive={resident.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-emerald-900/10">
        {data.items.map((resident) => (
          <div key={resident.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-950">{resident.name}</p>
                <p className="text-sm text-slate-500">{resident.phone || "Tidak ada no HP"}</p>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  resident.isActive
                    ? "status-active"
                    : "status-danger"
                }`}
              >
                {resident.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Link href={`/masyarakat/${resident.id}`} className="link-primary text-sm">
                Lihat
              </Link>
              <Link href={`/masyarakat/${resident.id}/edit`} className="text-slate-600 text-sm font-medium">
                Edit
              </Link>
              <ResidentStatusAction id={resident.id} isActive={resident.isActive} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="bg-emerald-50/50 px-4 py-3 flex items-center justify-between border-t border-emerald-900/10 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Link
              href={`?page=${data.page - 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}`}
              className={`btn-secondary relative px-4 py-2 text-sm ${data.page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Sebelumnya
            </Link>
            <Link
              href={`?page=${data.page + 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}`}
              className={`btn-secondary ml-3 relative px-4 py-2 text-sm ${data.page >= data.totalPages ? "pointer-events-none opacity-50" : ""}`}
            >
              Berikutnya
            </Link>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Halaman <span className="font-medium">{data.page}</span> dari <span className="font-medium">{data.totalPages}</span> (Total: {data.total})
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Link
                  href={`?page=${data.page - 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-emerald-900/15 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50 ${data.page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                  Sebelumnya
                </Link>
                <Link
                  href={`?page=${data.page + 1}${search ? `&q=${search}` : ""}${status ? `&status=${status}` : ""}`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-emerald-900/15 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50 ${data.page >= data.totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                  Berikutnya
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
