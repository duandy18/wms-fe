// src/features/operations/inbound/commit/TraceIdField.tsx

import React from "react";

export const TraceIdField: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="mt-2 space-y-1 text-xs">
      <label className="block text-slate-500">
        trace_id（可选，用于 Trace / Ledger / Snapshot 聚合）
      </label>
      <input
        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
        placeholder="为空时自动生成：inbound:cockpit:{task_id}:{timestamp}"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
