// src/features/operations/count/CountCockpitHistoryCard.tsx
// 盘点 Cockpit 历史记录

import React from "react";
import type { CountCockpitController } from "./types";

export const CountCockpitHistoryCard: React.FC<{
  c: CountCockpitController;
}> = ({ c }) => {
  const list = c.history;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">
        盘点历史（最近 50 条）
      </h2>
      {list.length === 0 ? (
        <div className="text-xs text-slate-500">暂无历史记录。</div>
      ) : (
        <div className="max-h-56 overflow-y-auto">
          <ul className="space-y-1 text-[11px] text-slate-700">
            {list.map((h) => (
              <li
                key={h.id}
                className="border-b border-slate-100 pb-1 flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    #{h.id.toString().padStart(3, "0")} · {h.ts}
                  </span>
                  <span
                    className={
                      "px-1.5 py-0.5 rounded-full " +
                      (h.ok
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200")
                    }
                  >
                    {h.ok ? "OK" : "FAIL"}
                  </span>
                </div>
                <div className="text-slate-600">
                  item={h.req.item_id ?? "-"} · wh=
                  {h.req.warehouse_id ?? "-"} · qty={h.req.qty ?? "-"} ·
                  batch={h.req.batch_code || "-"}
                </div>
                <div className="text-slate-500">
                  prod={h.req.production_date || "-"} · exp=
                  {h.req.expiry_date || "-"}
                </div>
                {h.error && (
                  <div className="text-red-600">错误：{h.error}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
