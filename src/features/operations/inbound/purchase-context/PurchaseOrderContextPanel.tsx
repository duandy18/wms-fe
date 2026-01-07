// src/features/operations/inbound/purchase-context/PurchaseOrderContextPanel.tsx

import React, { useCallback, useState } from "react";
import type { InboundCockpitController } from "../types";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { PurchaseOrderDetailReadonly } from "./PurchaseOrderDetailReadonly";
import { InboundUI } from "../ui";

function safeErrMsg(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

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

  const [refreshingDetail, setRefreshingDetail] = useState(false);
  const [refreshDetailErr, setRefreshDetailErr] = useState<string | null>(null);

  const handleRefreshDetail = useCallback(async () => {
    if (refreshingDetail) return;

    setRefreshingDetail(true);
    setRefreshDetailErr(null);

    try {
      if (po) {
        await c.loadPoById(String(po.id));
      } else if (selectedPoId) {
        await c.loadPoById(String(selectedPoId));
      }

      if (c.currentTask) {
        await c.reloadTask();
      }

      if (!po && !selectedPoId && !c.currentTask) {
        setRefreshDetailErr("尚未选择采购单/绑定任务，暂无可刷新内容。");
      }
    } catch (e: unknown) {
      setRefreshDetailErr(safeErrMsg(e, "刷新失败"));
    } finally {
      setRefreshingDetail(false);
    }
  }, [po, selectedPoId, refreshingDetail, c]);

  return (
    <div className={InboundUI.cardGap}>
      {/* 强提示：加载/错误/重试（保留，但字号统一） */}
      {c.loadingPo ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] text-sky-800">
          正在打开采购单{openingId ? ` #${openingId}` : ""}…
        </div>
      ) : c.poError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 flex items-center justify-between gap-2">
          <div className="truncate">打开采购单失败：{c.poError}</div>
          <button
            type="button"
            className={InboundUI.btnGhost}
            onClick={() => {
              if (selectedPoId) void onSelectPoId(selectedPoId);
            }}
            disabled={!selectedPoId}
          >
            重试
          </button>
        </div>
      ) : selectedPoId && !po ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 flex items-center justify-between gap-2">
          <div className="truncate">已选择采购单 #{selectedPoId}，但详情尚未加载。</div>
          <button
            type="button"
            className={InboundUI.btnGhost}
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

      <PurchaseOrderDetailReadonly
        po={po}
        onRefresh={() => void handleRefreshDetail()}
        refreshing={refreshingDetail}
        refreshErr={refreshDetailErr}
        rightHint={
          c.currentTask ? <span className={InboundUI.quiet}>关联任务 #{c.currentTask.id}</span> : null
        }
      />
    </div>
  );
}
