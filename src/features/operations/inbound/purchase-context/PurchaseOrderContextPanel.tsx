// src/features/operations/inbound/purchase-context/PurchaseOrderContextPanel.tsx

import React, { useCallback, useState } from "react";
import type { InboundCockpitController } from "../types";
import type { PurchaseOrderWithLines } from "../../../purchase-orders/api";
import { PurchaseOrderList } from "./PurchaseOrderList";
import { PurchaseOrderDetailReadonly } from "./PurchaseOrderDetailReadonly";

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
    // ✅ 按钮永远可点；这里做“并发保护”
    if (refreshingDetail) return;

    setRefreshingDetail(true);
    setRefreshDetailErr(null);

    try {
      // 1) 优先刷新采购单（po 已在内存中）
      if (po) {
        await c.loadPoById(String(po.id));
      } else if (selectedPoId) {
        // 2) 还没拿到 po，也允许刷新：用 selectedPoId 拉一次
        await c.loadPoById(String(selectedPoId));
      }

      // 3) 若已绑定收货任务，同时刷新任务（右侧/下方同步最新已收/状态）
      if (c.currentTask) {
        await c.reloadTask();
      }

      // 4) 两者都没有时给明确提示（不弹窗）
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

      <PurchaseOrderDetailReadonly
        po={po}
        // ✅ 永远提供 onRefresh：按钮永远可点
        onRefresh={() => void handleRefreshDetail()}
        refreshing={refreshingDetail}
        refreshErr={refreshDetailErr}
        rightHint={
          c.currentTask ? <span className="text-slate-500">关联任务 #{c.currentTask.id}</span> : null
        }
      />
    </div>
  );
}
