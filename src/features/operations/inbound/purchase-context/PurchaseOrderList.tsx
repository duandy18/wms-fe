// src/features/operations/inbound/purchase-context/PurchaseOrderList.tsx

import React, { useMemo } from "react";
import type { PurchaseOrderListItem } from "../../../purchase-orders/api";
import { formatTsCompact, statusLabel, supplierLabel } from "./poHelpers";
import { InboundUI } from "../ui";

function warehouseLabel(p: PurchaseOrderListItem): string {
  const n = String(p.warehouse_name ?? "").trim();
  if (n) return n;
  return `WH#${p.warehouse_id}`;
}

function pickPlanTime(p: PurchaseOrderListItem): string {
  const t = String(p.purchase_time ?? "").trim();
  if (t) return formatTsCompact(t);
  return formatTsCompact(p.created_at);
}

function remarkShort(p: PurchaseOrderListItem, maxLen = 24): string {
  const s = String(p.remark ?? "").trim();
  if (!s) return "—";
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + "…";
}

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
    return <div className={InboundUI.quiet}>暂无需要收货的采购计划。</div>;
  }

  return (
    <div className="space-y-2">
      {/* 方案A：纯计划目录（7 列：状态仅展示，不提供操作） */}
      <div className="hidden md:block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-[12px] text-slate-600">
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-2 font-medium">计划编号</div>
          <div className="col-span-3 font-medium">供应商</div>
          <div className="col-span-2 font-medium">仓库</div>
          <div className="col-span-2 font-medium">采购时间</div>
          <div className="col-span-1 font-medium">采购人</div>
          <div className="col-span-1 font-medium">备注</div>
          <div className="col-span-1 font-medium text-right">状态</div>
        </div>
      </div>

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
              title={p.remark ? String(p.remark) : undefined}
            >
              {/* 桌面端：严格 7 列 */}
              <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                <div className="col-span-2 font-mono text-[13px] text-slate-900">PO-{p.id}</div>

                <div className="col-span-3 truncate text-[13px] text-slate-900">{supplierLabel(p)}</div>

                <div className="col-span-2 truncate text-[13px] text-slate-700">{warehouseLabel(p)}</div>

                <div className="col-span-2 font-mono text-[12px] text-slate-600">{pickPlanTime(p)}</div>

                <div className="col-span-1 truncate text-[13px] text-slate-700">{p.purchaser || "-"}</div>

                <div className="col-span-1 truncate text-[13px] text-slate-600">{remarkShort(p)}</div>

                <div className="col-span-1 text-right text-[13px] text-slate-700">{statusLabel(p.status)}</div>
              </div>

              {/* 移动端：两行摘要（仍然只用计划字段） */}
              <div className="md:hidden space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 text-[14px]">
                      PO-{p.id} · {supplierLabel(p)}
                    </span>
                  </div>
                  <div className="shrink-0 text-slate-700 text-[13px]">{statusLabel(p.status)}</div>
                </div>

                <div className="flex items-center justify-between gap-3 text-[12px] text-slate-600">
                  <div className="truncate">
                    {warehouseLabel(p)} · {pickPlanTime(p)} · {p.purchaser || "-"}
                  </div>
                  <div className="shrink-0 truncate text-slate-500">{remarkShort(p, 12)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
