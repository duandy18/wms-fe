// src/features/operations/inbound/scan/StatusPill.tsx

import React from "react";
import type { StatusLevel } from "./types";

export const StatusPill: React.FC<{
  statusLevel: StatusLevel;
  statusMsg: string | null;
}> = ({ statusLevel, statusMsg }) => {
  if (!statusMsg) return null;

  const cls =
    statusLevel === "ok"
      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
      : statusLevel === "warn"
      ? "bg-amber-50 border border-amber-200 text-amber-700"
      : statusLevel === "error"
      ? "bg-red-50 border border-red-200 text-red-700"
      : "bg-slate-50 border border-slate-200 text-slate-500";

  return (
    <div className={"mt-1 rounded-md px-2 py-1 inline-block " + cls}>
      {statusMsg}
    </div>
  );
};
