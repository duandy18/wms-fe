// src/features/admin/stores/components/order-sim/execute/JsonBox.tsx

import React, { useMemo } from "react";

export function JsonBox(props: { title: string; value: unknown }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(props.value, null, 2);
    } catch {
      return String(props.value);
    }
  }, [props.value]);

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-800">{props.title}</div>
      <pre className="mt-2 whitespace-pre-wrap break-words rounded-md bg-white p-3 text-xs text-slate-700 border border-slate-200 overflow-auto max-h-[360px]">
        {text}
      </pre>
    </div>
  );
}
