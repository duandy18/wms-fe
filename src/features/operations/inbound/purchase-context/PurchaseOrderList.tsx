// src/features/operations/inbound/purchase-context/PurchaseOrderList.tsx

import React, { useMemo } from "react";
import type { PurchaseOrderListItem } from "../../../purchase-orders/api";
import { formatTsCompact, statusLabel, supplierLabel } from "./poHelpers";
import { InboundUI } from "../ui";

export function PurchaseOrderList(props: {
  poOptions: PurchaseOrderListItem[];
  loading: boolean;
  error: string | null;
  selectedPoId: string;
  onSelectPoId: (poId: string) => Promise<void>;
}) {
  const { poOptions, loading, error, selectedPoId, onSelectPoId } = props;

  const list = useMemo(() => {
    const v = [...poOptions];
    v.sort((a, b) => b.id - a.id);
    return v;
  }, [poOptions]);

  if (error) {
    return <div className={InboundUI.danger}>{error}</div>;
  }
  if (loading) {
    return <div className={InboundUI.quiet}>加载中…</div>;
  }
  if (list.length === 0) {
    return <div className={InboundUI.quiet}>暂无需要收货的采购单。</div>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {list.map((p) => {
          const active = String(p.id) === String(selectedPoId);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => void onSelectPoId(String(p.id))}
              className={[
                "w-full text-left rounded-lg border transition",
                "px-4 py-3",
                "bg-white border-slate-200 hover:bg-slate-50",
                active ? "bg-sky-50 border-sky-300 ring-1 ring-sky-200" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-semibold text-slate-900 text-[14px]">
                    #{p.id} · {supplierLabel(p)}
                  </span>

                  <span className="mx-2 text-slate-300">·</span>

                  <span className="text-slate-600 text-[13px]">
                    创建 {formatTsCompact(p.created_at)}
                  </span>
                </div>

                <div className="shrink-0 text-slate-700 text-[13px]">
                  {statusLabel(p.status)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
