// src/features/operations/outbound-pick/platformOrderMirror/RawJsonPanel.tsx
import React, { useMemo, useState } from "react";
import { safeJson } from "./jsonPick";

export const RawJsonPanel: React.FC<{
  title?: string;
  payload: unknown;
  defaultOpen?: boolean;
}> = ({ title = "Raw JSON（完整镜像）", payload, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const text = useMemo(() => safeJson(payload), [payload]);

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          className="text-[11px] font-semibold text-slate-700 hover:text-slate-900"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "▾ " : "▸ "}
          {title}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              void navigator.clipboard.writeText(text);
            }}
          >
            复制 JSON
          </button>
        </div>
      </div>

      {open ? (
        <pre className="max-h-[360px] overflow-auto px-3 py-2 text-[11px] leading-5 text-slate-800">
{text}
        </pre>
      ) : null}
    </div>
  );
};
