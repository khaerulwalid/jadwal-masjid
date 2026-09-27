import Link from "next/link";
import GroupStatusAction from "./group-status-action";
import GroupReorder from "./group-reorder";
import { GroupService } from "@/services/group.service";

export default async function GroupList({
  search,
  status,
}: {
  search?: string;
  status?: "all" | "active" | "inactive";
}) {
  const groups = await GroupService.getGroups({ search, status });

  if (groups.length === 0) {
    if (search) {
      return (
        <div className="app-card p-8 text-center text-slate-500">
          Tidak ada kelompok yang cocok dengan pencarian &quot;{search}&quot;.
        </div>
      );
    }
    return (
      <div className="app-card p-8 text-center">
        <p className="text-slate-500 mb-4">Belum ada data kelompok.</p>
        <p className="text-sm text-slate-400 mb-6">
          Tambahkan kelompok pertama agar masyarakat dapat ditempatkan.
        </p>
        <Link
          href="/kelompok/tambah"
          className="btn-primary py-2 px-4"
        >
          Tambah Kelompok
        </Link>
      </div>
    );
  }

  // Only allow reorder if we are viewing all active groups without search
  const canReorder = status !== "inactive" && !search;
  const orderedGroups = groups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <div className="app-card overflow-hidden">
      {canReorder && (
        <div className="px-4 py-3 border-b border-emerald-900/10 bg-emerald-50/70 text-sm text-emerald-800 flex justify-between items-center">
          <span>Anda dapat mengatur urutan rotasi kelompok.</span>
          <GroupReorder orderedGroups={orderedGroups} />
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="app-table">
          <thead>
            <tr>
              <th scope="col" className="w-20">
                Urutan
              </th>
              <th scope="col">
                Nama Kelompok
              </th>
              <th scope="col">
                Anggota Aktif
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
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="whitespace-nowrap text-sm text-emerald-900 font-bold">
                  {group.sequenceNo}
                </td>
                <td className="whitespace-nowrap text-sm font-semibold text-slate-950">
                  {group.name}
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  {group.memberCount} anggota
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      group.isActive
                        ? "status-active"
                        : "status-danger"
                    }`}
                  >
                    {group.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link href={`/kelompok/${group.id}`} className="link-primary">
                    Lihat
                  </Link>
                  <Link href={`/kelompok/${group.id}/edit`} className="text-slate-600 hover:text-slate-950">
                    Edit
                  </Link>
                  <GroupStatusAction id={group.id} isActive={group.isActive} memberCount={group.memberCount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-emerald-900/10">
        {groups.map((group) => (
          <div key={group.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-950">{group.name}</p>
                <p className="text-sm text-slate-500">Urutan: {group.sequenceNo} • {group.memberCount} anggota</p>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  group.isActive
                    ? "status-active"
                    : "status-danger"
                }`}
              >
                {group.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Link href={`/kelompok/${group.id}`} className="link-primary text-sm">
                Lihat
              </Link>
              <Link href={`/kelompok/${group.id}/edit`} className="text-slate-600 text-sm font-medium">
                Edit
              </Link>
              <GroupStatusAction id={group.id} isActive={group.isActive} memberCount={group.memberCount} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
