import React from "react";
import { Filter } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className = ""
}: FilterDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{label}:</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || "Filter"}
          className="appearance-none bg-white border border-slate-200 text-slate-800 text-xs font-medium py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-sm"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export default FilterDropdown;

