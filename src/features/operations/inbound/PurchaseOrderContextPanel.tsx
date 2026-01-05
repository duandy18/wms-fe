// src/features/operations/inbound/PurchaseOrderContextPanel.tsx

import React from "react";
import type { InboundCockpitController } from "./types";
import type { PurchaseOrderWithLines } from "../../purchase-orders/api";

export function PurchaseOrderContextPanel(props: {
  c: InboundCockpitController;
  po: InboundCockpitController["currentPo"];
  poOptions: PurchaseOrderWithLines[];
  loadingPoOptions: boolean;
  poOptionsError: string | null;
  selectedPoId: string;
  onSelectPo: (e: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
  onManualLoadPo: () => Promise<void>;
}) {
  const {
    c,
    po,
    poOptions,
    loadingPoOptions,
    poOptionsError,
    selectedPoId,
    onSelectPo,
    onManualLoadPo,
  } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600">采购单</span>
        <button
          type="button"
          onClick={() => void onManualLoadPo()}
          disabled={c.loadingPo}
          className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {c.loadingPo ? "加载中…" : "按ID加载"}
        </button>
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <span className="text-slate-500">最近采购单</span>
        <div className="flex items-center gap-2">
          <select
            className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs"
            value={selectedPoId}
            onChange={(e) => void onSelectPo(e)}
            disabled={loadingPoOptions || !!poOptionsError}
          >
            <option value="">
              {loadingPoOptions
                ? "加载中…"
                : poOptionsError
                ? "加载失败"
                : "请选择"}
            </option>
            {poOptions.map((p) => {
              const supplier = p.supplier_name ?? p.supplier ?? "未知供应商";
              const label = `#${p.id} · ${supplier} · ${p.status}`;
              return (
                <option key={p.id} value={p.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        {poOptionsError && (
          <span className="text-[11px] text-red-600">{poOptionsError}</span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs mt-1">
        <span className="text-slate-500">采购单ID：</span>
        <input
          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs"
          placeholder="ID"
          value={c.poIdInput}
          onChange={(e) => c.setPoIdInput(e.target.value)}
        />
      </div>

      {po ? (
        <div className="mt-2 space-y-1 text-xs text-slate-700">
          <div>
            <span className="font-mono">#{po.id}</span> ·{" "}
            <span>{po.supplier_name ?? po.supplier}</span>
          </div>
          <div className="text-slate-500">
            仓库：{po.warehouse_id} · 状态：{po.status} · 行数：{po.lines.length}
          </div>
        </div>
      ) : (
        <div className="mt-1 text-xs text-slate-500">未加载采购单</div>
      )}
    </div>
  );
}
