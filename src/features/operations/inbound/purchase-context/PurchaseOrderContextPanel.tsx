// src/features/operations/inbound/purchase-context/PurchaseOrderContextPanel.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { PurchaseOrderDetailReadonly } from "./PurchaseOrderDetailReadonly";

export function PurchaseOrderContextPanel(props: {
  c: InboundCockpitController;
  po: InboundCockpitController["currentPo"];
  poOptions: PurchaseOrderWithLines[];
  loadingPoOptions: boolean;
  poOptionsError: string | null;
  selectedPoId: string;
  onSelectPoId: (poId: string) => Promise<void>;
}) {
  const {
    c,
    po,
    poOptions,
    loadingPoOptions,
    poOptionsError,
    selectedPoId,
    onSelectPoId,
  } = props;

  const openingId = selectedPoId || c.poIdInput;

  return (
    <div className="space-y-4">
      {/* 强提示：加载/错误/重试（留在 context 层，列表组件保持纯展示） */}
      {c.loadingPo ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[12px] text-sky-800">
          正在打开采购单{openingId ? ` #${openingId}` : ""}…
        </div>
      ) : c.poError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 flex items-center justify-between gap-2">
          <div className="truncate">打开采购单失败：{c.poError}</div>
          <button
            type="button"
            className="shrink-0 rounded-md border border-red-300 bg-white px-2 py-1 text-[11px] text-red-700 hover:bg-red-50"
            onClick={() => {
              if (selectedPoId) void onSelectPoId(selectedPoId);
            }}
            disabled={!selectedPoId}
          >
            重试
          </button>
        </div>
      ) : selectedPoId && !po ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 flex items-center justify-between gap-2">
          <div className="truncate">已选择采购单 #{selectedPoId}，但详情尚未加载。</div>
          <button
            type="button"
            className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
            onClick={() => void onSelectPoId(selectedPoId)}
          >
            重新打开
          </button>
        </div>
      ) : null}

      <PurchaseOrderList
        poOptions={poOptions}
        loading={loadingPoOptions}
        error={poOptionsError}
        selectedPoId={selectedPoId}
        onSelectPoId={onSelectPoId}
      />

      <PurchaseOrderDetailReadonly po={po} />
    </div>
  );
}
