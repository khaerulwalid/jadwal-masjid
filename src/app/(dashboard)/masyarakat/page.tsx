import Link from "next/link";
import ResidentList from "@/components/residents/resident-list";
import ResidentSearch from "@/components/residents/resident-search";
import { Suspense } from "react";

export default async function MasyarakatPage(props: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q || "";
  const statusParam = searchParams.status || "active";
  const status = ["all", "active", "inactive"].includes(statusParam)
    ? (statusParam as "all" | "active" | "inactive")
    : "active";
  const page = parseInt(searchParams.page || "1", 10) || 1;

  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Masyarakat</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola data masyarakat untuk jadwal gotong royong.</p>
        </div>
        <Link
          href="/masyarakat/tambah"
          className="btn-primary py-2 px-4"
        >
          Tambah Masyarakat
        </Link>
      </div>

      <Suspense fallback={<div className="h-10 bg-gray-200 animate-pulse rounded-md w-full sm:w-1/2 mb-6"></div>}>
        <ResidentSearch />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-lg border border-gray-200 w-full"></div>}>
        <ResidentList search={search} status={status} page={page} />
      </Suspense>
    </div>
  );
}
