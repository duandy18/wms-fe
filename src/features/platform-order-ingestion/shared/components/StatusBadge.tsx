import React from "react";

function getBadgeClass(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "success" ||
    normalized === "ready" ||
    normalized === "valid" ||
    normalized === "connected" ||
    normalized === "active" ||
    normalized === "是"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "failed" ||
    normalized === "error" ||
    normalized === "expired" ||
    normalized === "missing" ||
    normalized === "not_connected" ||
    normalized === "否"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    normalized === "running" ||
    normalized === "pending" ||
    normalized === "partial_success" ||
    normalized === "warn"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export const StatusBadge: React.FC<{
  value: string | number | boolean | null | undefined;
}> = ({ value }) => {
  const text = value === true ? "是" : value === false ? "否" : value ?? "—";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getBadgeClass(
        String(text),
      )}`}
    >
      {text}
    </span>
  );
};
