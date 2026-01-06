// src/features/operations/inbound/purchase-context/PurchaseOrderList.tsx

import React, { useMemo } from "react";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { formatTsCompact, statusLabel, supplierLabel } from "./poHelpers";

export function PurchaseOrderList(props: {
  poOptions: PurchaseOrderWithLines[];
  loading: boolean;
  error: string | null;
  selectedPoId: string;
  onSelectPoId: (poId: string) => Promise<void>;
}) {
  const { poOptions, loading, error, selectedPoId, onSelectPoId } = props;

  // 作业台语义：全部都是“当前需要处理的”
  const list = useMemo(() => {
    const v = [...poOptions];
    v.sort((a, b) => b.id - a.id);
    return v;
  }, [poOptions]);

  return (
    <div className="space-y-2">
      {error ? (
        <div className="text-[11px] text-red-600">{error}</div>
      ) : loading ? (
        <div className="text-[11px] text-slate-500">加载中…</div>
      ) : list.length === 0 ? (
        <div className="text-[11px] text-slate-500">暂无需要收货的采购单。</div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {list.map((p) => {
            const active = String(p.id) === String(selectedPoId);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => void onSelectPoId(String(p.id))}
                className={[
                  "w-full text-left rounded-lg border px-3 py-2 transition",
                  "bg-white border-slate-200 hover:bg-slate-50",
                  active
                    ? "bg-sky-50 border-sky-300 ring-1 ring-sky-200"
                    : "",
                ].join(" ")}
              >
                {/* 单行：标题 / 创建时间 / 状态（同字号） */}
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="font-medium text-slate-900">
                      #{p.id} · {supplierLabel(p)}
                    </span>

                    <span className="mx-2 text-slate-300">·</span>

                    <span className="text-slate-600">
                      创建 {formatTsCompact(p.created_at)}
                    </span>
                  </div>

                  <div className="shrink-0 text-slate-700">
                    {statusLabel(p.status)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
