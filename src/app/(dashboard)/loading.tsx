import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="page-surface p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-slate-300 rounded animate-pulse mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-56 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
