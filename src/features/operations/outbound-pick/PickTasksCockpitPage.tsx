// src/features/operations/outbound-pick/PickTasksCockpitPage.tsx
//
// 拣货任务 Cockpit（条码驱动版）

import React from "react";
import { useNavigate } from "react-router-dom";

import { PickTaskListPanel } from "./PickTaskListPanel";
import { PickTaskDetailPanel } from "./PickTaskDetailPanel";
import { PickTaskDiffPanel } from "./PickTaskDiffPanel";
import { PickTaskScanPanel } from "./PickTaskScanPanel";
import { PickTaskCommitPanel } from "./PickTaskCommitPanel";
import { PickTaskFefoPanel } from "./PickTaskFefoPanel";
import { PickTaskPostCommitPanel } from "./PickTaskPostCommitPanel";

import { usePickTasksCockpitController } from "./usePickTasksCockpitController";
import type { StatusFilter } from "./types_cockpit";

const PickTasksCockpitPage: React.FC = () => {
  const navigate = useNavigate();

  const c = usePickTasksCockpitController({
    navigateToBarcodeBind: (barcode: string) => {
      const msg = `条码 ${barcode} 未能解析出有效商品，请在条码管理中完成绑定后再试。`;
      const go = window.confirm(`${msg}\n\n是否现在前往「条码管理」进行绑定？`);
      if (go) {
        navigate(`/admin/items?barcode=${encodeURIComponent(barcode)}`);
      }
    },
  });

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">拣货</h1>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.0fr)_minmax(0,2.0fr)]">
        {/* 左：任务列表 */}
        <PickTaskListPanel
          tasks={c.visibleTasks}
          loading={c.loadingList}
          error={c.listError}
          warehouseId={c.warehouseId}
          statusFilter={c.statusFilter}
          sourceFilter={c.sourceFilter}
          onChangeWarehouse={c.setWarehouseId}
          onChangeStatus={(v) => c.setStatusFilter(v as StatusFilter)}
          onChangeSourceFilter={c.setSourceFilter}
          selectedTaskId={c.selectedTaskId}
          onSelectTask={c.setSelectedTaskId}
          onRefresh={c.loadTasks}
        />

        {/* 右：总览 / 批次与拣货 / 提交 / 提交后链路 */}
        <div className="space-y-6">
          {/* 卡1：任务总览 */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">任务总览</h2>
              {c.loadingDetail && (
                <span className="text-[11px] text-slate-500">详情加载中…</span>
              )}
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
              platform={c.currentPlatformShop?.platform ?? "PDD"}
              shopId={c.currentPlatformShop?.shop_id ?? "1"}
              onCommit={c.handleCommit}
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
    </div>
  );
};

export default PickTasksCockpitPage;
