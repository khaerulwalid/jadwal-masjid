import Link from "next/link";
import { formatDisplayDate } from "@/lib/date";
import MoveMemberDialog from "./move-member-dialog";
import RemoveMemberAction from "./remove-member-action";

export default function GroupMembers({
  groupId,
  groupIsActive,
  members,
  availableGroups,
}: {
  groupId: string;
  groupIsActive: boolean;
  members: { membershipId: string; residentId: string; name: string; phone: string | null; joinedAt: string }[];
  availableGroups: { id: string; name: string }[];
}) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Belum ada anggota di kelompok ini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
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
                Tanggal Bergabung
              </th>
              <th scope="col" className="text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {members.map((member) => (
              <tr key={member.residentId}>
                <td className="whitespace-nowrap text-sm font-semibold text-slate-950">
                  {member.name}
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  {member.phone || "-"}
                </td>
                <td className="whitespace-nowrap text-sm text-slate-500">
                  {formatDisplayDate(member.joinedAt)}
                </td>
                <td className="whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/masyarakat/${member.residentId}`} className="link-primary mr-3">
                    Lihat
                  </Link>
                  {groupIsActive && (
                    <>
                      <MoveMemberDialog
                        residentId={member.residentId}
                        residentName={member.name}
                        currentGroupId={groupId}
                        availableGroups={availableGroups}
                      />
                      <RemoveMemberAction
                        residentId={member.residentId}
                        groupId={groupId}
                        residentName={member.name}
                      />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="sm:hidden divide-y divide-emerald-900/10">
        {members.map((member) => (
          <div key={member.residentId} className="p-4 space-y-2">
            <div>
              <p className="text-sm font-semibold text-slate-950">{member.name}</p>
              <p className="text-xs text-slate-500">{member.phone || "Tidak ada no HP"}</p>
              <p className="text-xs text-slate-500 mt-1">Bergabung: {formatDisplayDate(member.joinedAt)}</p>
            </div>
            <div className="flex space-x-3 pt-2 justify-end">
              <Link href={`/masyarakat/${member.residentId}`} className="link-primary text-sm">
                Lihat
              </Link>
              {groupIsActive && (
                <>
                  <MoveMemberDialog
                    residentId={member.residentId}
                    residentName={member.name}
                    currentGroupId={groupId}
                    availableGroups={availableGroups}
                  />
                  <RemoveMemberAction
                    residentId={member.residentId}
                    groupId={groupId}
                    residentName={member.name}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
