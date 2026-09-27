import Link from "next/link";
import GroupList from "@/components/groups/group-list";
import GroupSearch from "@/components/groups/group-search";
import { Suspense } from "react";

export default async function KelompokPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q || "";
  const statusParam = searchParams.status || "active";
  const status = ["all", "active", "inactive"].includes(statusParam)
    ? (statusParam as "all" | "active" | "inactive")
    : "active";

  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Kelompok</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola data kelompok dan atur urutan rotasinya.</p>
        </div>
        <Link
          href="/kelompok/tambah"
          className="btn-primary py-2 px-4"
        >
          Tambah Kelompok
        </Link>
      </div>

      <Suspense fallback={<div className="h-10 bg-gray-200 animate-pulse rounded-md w-full sm:w-1/2 mb-6"></div>}>
        <GroupSearch />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg border border-gray-200 w-full"></div>}>
        <GroupList search={search} status={status} />
      </Suspense>
    </div>
  );
}
