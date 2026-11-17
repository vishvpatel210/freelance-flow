import React from "react";

export function LoadingSpinner({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-100"></div>
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-indigo-600 animate-spin"></div>
      </div>
      {text && <p className="mt-4 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-4 px-6">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-slate-100 rounded"
              style={{ width: `${Math.max(30, 90 - cIdx * 15)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;

