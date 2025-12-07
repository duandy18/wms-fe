// src/features/operations/outbound-pick/OutboundPickHistoryPanel.tsx
//
// 历史操作列表 Panel

import React from "react";
import type { ScanRequest, ScanResponse } from "../scan/api";

export type HistoryEntry = {
  id: number;
  kind: "form" | "scan";
  req: Partial<ScanRequest>;
  resp: ScanResponse | null;
  error: string | null;
};

type Props = {
  history: HistoryEntry[];
};

export const OutboundPickHistoryPanel: React.FC<Props> = ({ history }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
      <h2 className="text-sm font-semibold text-slate-800">
        最近操作（历史）
      </h2>
      {history.length === 0 ? (
        <p className="text-xs text-slate-500">暂无历史。</p>
      ) : (
        <ul className="space-y-1 text-[11px] text-slate-700">
          {history.slice(0, 10).map((h) => (
            <li key={h.id} className="border-b border-slate-100 pb-1">
              #{h.id.toString().padStart(3, "0")} | {h.kind} | wh=
              {h.req.warehouse_id} | item={h.req.item_id} | qty={h.req.qty} |{" "}
              {h.error ? (
                <span className="text-red-600">错误：{h.error}</span>
              ) : (
                <span className="text-emerald-600">OK</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
