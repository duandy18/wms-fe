// src/features/operations/outbound-pick/PickTasksCockpitPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PickTaskDetailPanel } from "./PickTaskDetailPanel";
import { PickTaskCommitPanel } from "./PickTaskCommitPanel";
import { PickTaskPostCommitPanel } from "./PickTaskPostCommitPanel";

import { PickTicketPrintModal, type ItemMetaMap } from "./PickTicketPrintModal";
import { PickTaskScanBar } from "./PickTaskScanBar";
import { OrderPickSidebar } from "./OrderPickSidebar";

import { usePickTasksCockpitController } from "./usePickTasksCockpitController";
import type { OrderSummary, OrderView } from "../../orders/api";
import { createPickTaskFromOrder, type PickTask } from "./pickTasksApi";

import { useOrderInlineDetail } from "../../orders/hooks/useOrderInlineDetail";
import { PlatformOrderMirrorPanel } from "./PlatformOrderMirrorPanel";

function normalizeOrderForMirror(input: unknown): OrderView["order"] | null {
  if (!input || typeof input !== "object") return null;

  const obj = input as Record<string, unknown>;

  // 形态 A：就是 OrderView（外壳）
  if ("order" in obj) {
    const inner = obj.order;
    if (inner && typeof inner === "object") return inner as OrderView["order"];
    return null;
  }

  // 形态 B：就是 OrderView["order"]（内层）
  if ("platform" in obj && "shop_id" in obj && "ext_order_no" in obj) {
    return obj as unknown as OrderView["order"];
  }

  return null;
}

const PickTasksCockpitPage: React.FC = () => {
  const navigate = useNavigate();
  const [printOpen, setPrintOpen] = useState(false);

  // ✅ 订单详情（镜像）：只呈现平台原始订单，不附加作业语义
  const orderDetail = useOrderInlineDetail();

  const c = usePickTasksCockpitController({
    navigateToBarcodeBind: (barcode: string) => {
      const msg = `条码 ${barcode} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
      const go = window.confirm(`${msg}\n\n是否现在前往「条码管理」进行绑定？`);
      if (go) navigate(`/admin/items?barcode=${encodeURIComponent(barcode)}`);
    },
  });

  // ✅ 解构需要用于 hooks 的字段，避免直接依赖 c 对象
  const { scanPreview, scanSuccess, setActiveItemId, selectedTask } = c;

  const platform = c.currentPlatformShop?.platform ?? "PDD";
  const shopId = c.currentPlatformShop?.shop_id ?? "1";
  const printableItemMetaMap = useMemo(
    () => c.itemMetaMap as unknown as ItemMetaMap,
    [c.itemMetaMap],
  );

  useEffect(() => {
    if (!selectedTask && printOpen) setPrintOpen(false);
  }, [selectedTask, printOpen]);

  // ✅ 药房式反馈：扫码成功后，把命中 item 设为 active（用于滚动定位 + 高亮）
  useEffect(() => {
    const id = scanPreview?.item_id ?? null;
    if (!scanSuccess) return;
    if (id == null) return;
    setActiveItemId(id);
  }, [scanSuccess, scanPreview?.item_id, setActiveItemId]);

  const selectedOrderId = orderDetail.selectedSummary?.id ?? null;

  const handleSelectOrder = useCallback(
    (summary: OrderSummary) => {
      void orderDetail.loadDetail(summary);
    },
    [orderDetail],
  );

  const handleClearSelectedOrder = useCallback(() => {
    orderDetail.closeDetail();
  }, [orderDetail]);

  async function handleCreatePickTaskFromOrder(
    summary: OrderSummary,
  ): Promise<PickTask> {
    const task = await createPickTaskFromOrder(summary.id, {
      source: "ORDER",
      priority: 100,
    });

    await c.loadTasks();
    c.setSelectedTaskId(task.id);
    await c.loadTaskDetail(task.id);

    return task;
  }

  const mirrorOrder = useMemo(() => {
    return normalizeOrderForMirror(orderDetail.detailOrder);
  }, [orderDetail.detailOrder]);

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">拣货</h1>
        <div className="text-[11px] text-slate-500">
          工作台：任务表格是事实主视图；扫码是输入源；提交是唯一裁决点。
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <OrderPickSidebar
          selectedOrderId={selectedOrderId}
          onSelectOrder={handleSelectOrder}
          onClearSelectedOrder={handleClearSelectedOrder}
          onCreatePickTaskFromOrder={handleCreatePickTaskFromOrder}
        />

        <div className="space-y-6">
          {/* ✅ 平台订单镜像（不附加任何作业字段/提示/裁决） */}
          <PlatformOrderMirrorPanel
            summary={orderDetail.selectedSummary ?? null}
            detailOrder={mirrorOrder}
            loading={orderDetail.detailLoading}
            error={orderDetail.detailError}
            onReload={() => {
              void orderDetail.reloadDetail();
            }}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[11px] text-slate-500">当前执行任务</div>
                <div className="mt-1 font-mono text-[12px] text-slate-900">
                  {selectedTask
                    ? `#${selectedTask.id} · WH ${selectedTask.warehouse_id}`
                    : "未选择任务"}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {selectedTask
                    ? `ref: ${selectedTask.ref ?? "-"}`
                    : "请先选择一条拣货任务。"}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-[11px] text-slate-500">说明</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  订单区仅用于核对平台原始信息；拣货裁决以任务表格与提交结果为准。
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">① 任务表格</h2>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-60"
                onClick={() => setPrintOpen(true)}
                disabled={!selectedTask}
              >
                打印订单拣货单
              </button>
            </div>

            <PickTaskScanBar
              disabled={!selectedTask}
              scanBusy={c.scanBusy}
              scanError={c.scanError}
              scanSuccess={scanSuccess}
              scanQty={c.scanQty}
              onChangeScanQty={c.setScanQty}
              batchCodeOverride={c.scanBatchOverride}
              onChangeBatchCode={c.setScanBatchOverride}
              onScan={c.handleScan}
              previewItemId={scanPreview?.item_id ?? null}
              previewBatchCode={scanPreview?.batch_code ?? null}
              previewQty={scanPreview?.qty ?? null}
            />

            <PickTaskDetailPanel
              task={selectedTask}
              loading={c.loadingDetail}
              error={c.detailError}
              itemMetaMap={c.itemMetaMap}
              activeItemId={c.activeItemId}
              onSelectItemId={c.setActiveItemId}
              orderInfo={c.orderInfo}
              justScannedItemId={scanPreview?.item_id ?? null}
            />
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              ② 核对并提交出库
            </h2>

            <PickTaskCommitPanel
              task={selectedTask}
              allowDiff={c.allowDiff}
              onChangeAllowDiff={c.setAllowDiff}
              committing={c.commitBusy}
              commitError={c.commitError}
              platform={platform}
              shopId={shopId}
              onCommit={c.handleCommit}
            />

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-2 text-[11px] font-semibold text-slate-700">
                提交后链路
              </div>
              <PickTaskPostCommitPanel
                traceId={c.traceId}
                info={c.postCommitInfo}
                loading={c.postCommitLoading}
                error={c.postCommitError}
              />
            </div>
          </section>
        </div>
      </div>

      {selectedTask ? (
        <PickTicketPrintModal
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          task={selectedTask}
          platform={platform}
          shopId={shopId}
          itemMetaMap={printableItemMetaMap}
        />
      ) : null}
    </div>
  );
};

export default PickTasksCockpitPage;
