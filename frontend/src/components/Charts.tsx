import React from "react";

export function ProjectStatusChart({ stats = {} }: { stats: Record<string, number> }) {
  const categories = [
    { key: "pending", label: "Pending", color: "#f59e0b", bg: "bg-amber-500" },
    { key: "in-progress", label: "In Progress", color: "#6366f1", bg: "bg-indigo-500" },
    { key: "completed", label: "Completed", color: "#10b981", bg: "bg-emerald-500" },
    { key: "cancelled", label: "Cancelled", color: "#94a3b8", bg: "bg-slate-400" }
  ];

  const total = Object.values(stats).reduce((sum, val) => sum + (Number(val) || 0), 0);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Status Breakdown
          </span>
          <span className="text-sm font-bold text-slate-900">{total} Total</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-6">
          {total > 0 ? (
            categories.map((cat) => {
              const val = Number(stats[cat.key]) || 0;
              const pct = (val / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={cat.key}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  title={`${cat.label}: ${val} (${pct.toFixed(0)}%)`}
                  className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                />
              );
            })
          ) : (
            <div className="w-full bg-slate-100" />
          )}
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((cat) => {
          const val = Number(stats[cat.key]) || 0;
          const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={cat.key}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.bg}`}></span>
                <span className="text-xs font-medium text-slate-600">{cat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-900">{val}</span>
                <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TaskProgressChart({ stats = {} }: { stats: Record<string, number> }) {
  const categories = [
    { key: "completed", label: "Completed", color: "#10b981", bg: "bg-emerald-500" },
    { key: "in-progress", label: "In Progress", color: "#6366f1", bg: "bg-indigo-500" },
    { key: "pending", label: "Pending", color: "#f59e0b", bg: "bg-amber-500" }
  ];

  const total = Object.values(stats).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const completed = Number(stats.completed) || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completion Rate
          </span>
          <span className="text-sm font-bold text-emerald-600">{completionRate}% Done</span>
        </div>

        {/* Progress bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-6">
          {total > 0 ? (
            categories.map((cat) => {
              const val = Number(stats[cat.key]) || 0;
              const pct = (val / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={cat.key}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  title={`${cat.label}: ${val} (${pct.toFixed(0)}%)`}
                  className="transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                />
              );
            })
          ) : (
            <div className="w-full bg-slate-100" />
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const val = Number(stats[cat.key]) || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={cat.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.bg}`}></span>
                <span className="font-medium text-slate-600">{cat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{val}</span>
                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    className="h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RevenueChart({ totalRevenue = 0, pendingAmount = 0 }: { totalRevenue: number; pendingAmount: number }) {
  const grandTotal = totalRevenue + pendingAmount;
  const collectedPct = grandTotal > 0 ? Math.round((totalRevenue / grandTotal) * 100) : 100;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cash Flow Health
          </span>
          <span className="text-xs font-semibold text-indigo-600">{collectedPct}% Realized</span>
        </div>

        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-6">
          <div
            style={{ width: `${collectedPct}%` }}
            className="bg-emerald-500 transition-all duration-500 rounded-l-full"
            title={`Realized: $${totalRevenue.toLocaleString()}`}
          />
          <div
            style={{ width: `${100 - collectedPct}%` }}
            className="bg-amber-400 transition-all duration-500 rounded-r-full"
            title={`Pending: $${pendingAmount.toLocaleString()}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[11px] font-medium text-emerald-700 block">Collected</span>
          <span className="text-base font-bold text-slate-900 mt-0.5 block">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] font-medium text-amber-700 block">Awaiting</span>
          <span className="text-base font-bold text-slate-900 mt-0.5 block">
            ${pendingAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

