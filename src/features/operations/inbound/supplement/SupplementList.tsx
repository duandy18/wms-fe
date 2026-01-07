// src/features/operations/inbound/supplement/SupplementList.tsx

import React from "react";
import type { ReceiveSupplementLine } from "./types";
import { missingLabel } from "./labels";

export const SupplementList: React.FC<{
  items: ReceiveSupplementLine[];
  selectedKey: string | null;
  onSelect: (key: string, row: ReceiveSupplementLine) => void;
}> = ({ items, selectedKey, onSelect }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">待补录列表</h2>
        <span className="text-[11px] text-slate-500">点击一行进入补录</span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-600">暂无需要补录的记录。</div>
      ) : (
        <div className="space-y-2">
          {items.map((x) => {
            const key = `${x.task_id}-${x.item_id}`;
            const active = key === selectedKey;
            const missing = missingLabel(x.missing_fields).join(" / ");

            return (
              <button
                key={key}
                type="button"
                className={
                  "w-full text-left rounded-lg border p-3 " +
                  (active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800")
                }
                onClick={() => onSelect(key, x)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{x.item_name ?? "（未命名商品）"}</div>
                  <div className={active ? "text-[11px] text-slate-200" : "text-[11px] text-slate-500"}>
                    收货任务 #{x.task_id}
                  </div>
                </div>

                <div className={active ? "mt-1 text-xs text-slate-200" : "mt-1 text-xs text-slate-600"}>
                  已收：<span className="font-mono">{x.scanned_qty}</span> · 缺失：{missing}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
