// src/features/operations/outbound-pick/PickTasksCockpitPage.tsx
//
// 拣货任务 Cockpit（订单视角入口版）
// - 左：订单列表 + 下方订单详情（像入库页）
// - 右：创建拣货任务（必须选仓库）→ 批次与拣货 → 提交出库 → 提交后链路

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PickTaskDetailPanel } from "./PickTaskDetailPanel";
import { PickTaskDiffPanel } from "./PickTaskDiffPanel";
import { PickTaskScanPanel } from "./PickTaskScanPanel";
import { PickTaskCommitPanel } from "./PickTaskCommitPanel";
import { PickTaskFefoPanel } from "./PickTaskFefoPanel";
import { PickTaskPostCommitPanel } from "./PickTaskPostCommitPanel";

import { PickTicketPrintModal, type ItemMetaMap } from "./PickTicketPrintModal";
import { OrderPickSidebar } from "./OrderPickSidebar";

import { usePickTasksCockpitController } from "./usePickTasksCockpitController";
import type { OrderSummary } from "../../orders/api";

import { useActiveWarehouses } from "./orderPick/useActiveWarehouses";
import { useCreatePickTaskFromOrder } from "./orderPick/useCreatePickTaskFromOrder";
import { CreatePickTaskCard } from "./orderPick/CreatePickTaskCard";

const PickTasksCockpitPage: React.FC = () => {
  const navigate = useNavigate();

  const [printOpen, setPrintOpen] = useState(false);
  const [pickedOrder, setPickedOrder] = useState<OrderSummary | null>(null);

  const c = usePickTasksCockpitController({
    navigateToBarcodeBind: (barcode: string) => {
      const msg = `条码 ${barcode} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
      const go = window.confirm(`${msg}\n\n是否现在前往「条码管理」进行绑定？`);
      if (go) {
        navigate(`/admin/items?barcode=${encodeURIComponent(barcode)}`);
      }
    },
  });

  const platform = c.currentPlatformShop?.platform ?? "PDD";
  const shopId = c.currentPlatformShop?.shop_id ?? "1";

  const printableItemMetaMap = useMemo(() => {
    return (c.itemMetaMap as unknown) as ItemMetaMap;
  }, [c.itemMetaMap]);

  // 当任务被清空时，关闭打印层（避免“幽灵打印”）
  useEffect(() => {
    if (!c.selectedTask && printOpen) setPrintOpen(false);
  }, [c.selectedTask, printOpen]);

  const wh = useActiveWarehouses({ preferredId: 1 });

  const creator = useCreatePickTaskFromOrder({
    pickedOrder,
    selectedWarehouseId: wh.selectedWarehouseId,
    loadTasks: c.loadTasks,
    setSelectedTaskId: c.setSelectedTaskId,
    loadTaskDetail: c.loadTaskDetail,
  });

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">拣货</h1>
      </header>

      {/* 左右 1:1 平分 */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <OrderPickSidebar onPickOrder={setPickedOrder} />

        <div className="space-y-6">
          <CreatePickTaskCard
            pickedOrder={pickedOrder}
            warehouses={wh.warehouses}
            loadingWh={wh.loadingWh}
            whError={wh.whError}
            selectedWarehouseId={wh.selectedWarehouseId}
            setSelectedWarehouseId={wh.setSelectedWarehouseId}
            creatingTask={creator.creatingTask}
            createTaskError={creator.createTaskError}
            createdTask={creator.createdTask}
            canCreateTask={creator.canCreateTask && !wh.loadingWh && !wh.whError}
            onCreate={() => void creator.createTask()}
          />

          {/* 卡1：任务总览 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">任务总览</h2>
              {c.loadingDetail ? (
                <span className="text-[11px] text-slate-500">详情加载中…</span>
              ) : null}
            </div>

            <PickTaskDetailPanel
              task={c.selectedTask}
              loading={c.loadingDetail}
              error={c.detailError}
              itemMetaMap={c.itemMetaMap}
              activeItemId={c.activeItemId}
              onSelectItemId={c.setActiveItemId}
              orderInfo={c.orderInfo}
            />

            <PickTaskDiffPanel diff={c.diff} />
          </section>

          {/* 卡2：批次与拣货 */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">批次与拣货</h2>

            <PickTaskFefoPanel
              detail={c.fefoDetail}
              loading={c.fefoLoading}
              error={c.fefoError}
              activeItemMeta={c.activeItemMeta}
              onUseBatch={c.handleUseFefoBatch}
            />

            <PickTaskScanPanel
              task={c.selectedTask}
              scanBusy={c.scanBusy}
              scanError={c.scanError}
              scanSuccess={c.scanSuccess}
              batchCodeOverride={c.scanBatchOverride}
              onChangeBatchCode={c.setScanBatchOverride}
              scanQty={c.scanQty}
              onChangeScanQty={c.setScanQty}
              onScan={c.handleScan}
              previewItemId={c.scanPreview?.item_id ?? null}
              previewBatchCode={c.scanPreview?.batch_code ?? null}
              previewQty={c.scanPreview?.qty ?? null}
              activeItemMeta={c.activeItemMeta}
            />
          </section>

          {/* 卡3：提交出库 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">提交出库</h2>

            <PickTaskCommitPanel
              task={c.selectedTask}
              allowDiff={c.allowDiff}
              onChangeAllowDiff={c.setAllowDiff}
              committing={c.commitBusy}
              commitError={c.commitError}
              platform={platform}
              shopId={shopId}
              onCommit={c.handleCommit}
              onPrint={() => setPrintOpen(true)}
            />
          </section>

          {/* 卡4：提交后链路 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">提交后链路</h2>

            <PickTaskPostCommitPanel
              traceId={c.traceId}
              info={c.postCommitInfo}
              loading={c.postCommitLoading}
              error={c.postCommitError}
            />
          </section>
        </div>
      </div>

      {/* 拣货单打印层（打开即打印） */}
      {c.selectedTask ? (
        <PickTicketPrintModal
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          task={c.selectedTask}
          platform={platform}
          shopId={shopId}
          itemMetaMap={printableItemMetaMap}
        />
      ) : null}
    </div>
  );
};

export default PickTasksCockpitPage;
