import React from "react";

interface StatusBadgeProps {
  status?: string;
  type?: "status" | "priority";
}

export function StatusBadge({ status, type = "status" }: StatusBadgeProps) {
  if (!status) return null;

  const s = String(status).toLowerCase();

  const styles: Record<string, string> = {
    // Project & Task Statuses
    pending: "bg-amber-50 text-amber-700 border-amber-200/80",
    "in-progress": "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",

    // Deliverable Statuses
    submitted: "bg-sky-50 text-sky-700 border-sky-200/80",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    rejected: "bg-rose-50 text-rose-700 border-rose-200/80",

    // Payment Statuses
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    failed: "bg-rose-50 text-rose-700 border-rose-200/80",
    refunded: "bg-purple-50 text-purple-700 border-purple-200/80",

    // Priorities
    low: "bg-slate-100 text-slate-600 border-slate-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200/80",
    high: "bg-rose-50 text-rose-700 border-rose-200/80"
  };

  const style = styles[s] || "bg-slate-50 text-slate-600 border-slate-200";

  const labels: Record<string, string> = {
    "in-progress": "In Progress"
  };

  const label = labels[s] || s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
}

export default StatusBadge;

