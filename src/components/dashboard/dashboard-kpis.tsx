import { Users, UsersRound, CalendarDays, Wallet } from "lucide-react";
import { formatIDR } from "@/lib/money";

interface DashboardKPIsProps {
  data: {
    activeResidents: number;
    activeGroups: number;
    monthScheduleCount: number;
    monthReplacementTotal: number;
  };
}

export function DashboardKPIs({ data }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="app-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">Masyarakat Aktif</span>
            <span className="font-semibold text-slate-900 text-xl">{data.activeResidents}</span>
          </div>
        </div>
      </div>

      <div className="app-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-800">
            <UsersRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">Kelompok Aktif</span>
            <span className="font-semibold text-slate-900 text-xl">{data.activeGroups}</span>
          </div>
        </div>
      </div>

      <div className="app-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-800">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">Jadwal Bulan Ini</span>
            <span className="font-semibold text-slate-900 text-xl">{data.monthScheduleCount}</span>
          </div>
        </div>
      </div>

      <div className="app-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-800">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-slate-500 text-xs font-medium uppercase tracking-wider">Total Pengganti</span>
            <span className="font-semibold text-slate-900 text-xl">{formatIDR(data.monthReplacementTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
