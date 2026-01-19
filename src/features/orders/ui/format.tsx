// src/features/orders/ui/format.ts
import React from "react";

export const formatTs = (ts: string | null | undefined) =>
  ts ? ts.replace("T", " ").replace("Z", "") : "-";

export function renderStatus(status?: string | null) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
        -
      </span>
    );
  }
  const s = status.toUpperCase();
  let cls = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ";
  if (s === "CREATED" || s === "PAID" || s === "RESERVED") {
    cls += "bg-sky-50 text-sky-700 border border-sky-200";
  } else if (s === "SHIPPED") {
    cls += "bg-indigo-50 text-indigo-700 border border-indigo-200";
  } else if (s === "PARTIALLY_RETURNED") {
    cls += "bg-amber-50 text-amber-700 border border-amber-200";
  } else if (s === "RETURNED") {
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (s === "CANCELED") {
    cls += "bg-slate-100 text-slate-600 border border-slate-200";
  } else {
    cls += "bg-slate-50 text-slate-700 border border-slate-200";
  }
  return <span className={cls}>{status}</span>;
}
