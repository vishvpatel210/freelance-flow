import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: "indigo" | "emerald" | "amber" | "sky" | "violet";
  trend?: string;
  trendType?: "positive" | "neutral" | "negative";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "indigo",
  trend,
  trendType = "neutral"
}: StatCardProps) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
            colorStyles[iconColor] || colorStyles.indigo
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="text-2xl font-bold text-slate-900 tracking-tight">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 text-xs">
          {trend && (
            <span
              className={`font-medium ${
                trendType === "positive"
                  ? "text-emerald-600"
                  : trendType === "negative"
                  ? "text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;

