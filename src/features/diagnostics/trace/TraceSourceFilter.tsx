// src/features/diagnostics/trace/TraceSourceFilter.tsx
import React from "react";

export type SourceFilter = "ALL" | string;

type TraceSourceFilterProps = {
  sources: string[];
  value: SourceFilter;
  onChange: (value: SourceFilter) => void;
};

export const TraceSourceFilter: React.FC<TraceSourceFilterProps> = ({
  sources,
  value,
  onChange,
}) => {
  if (!sources.length) return null;

  return (
    <section className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-500">Source 过滤：</span>
      <button
        type="button"
        className={
          "px-2 py-1 rounded-full border " +
          (value === "ALL"
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-300")
        }
        onClick={() => onChange("ALL")}
      >
        ALL
      </button>
      {sources.map((src) => (
        <button
          key={src}
          type="button"
          className={
            "px-2 py-1 rounded-full border " +
            (value === src
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300")
          }
          onClick={() => onChange(src)}
        >
          {src}
        </button>
      ))}
    </section>
  );
};
