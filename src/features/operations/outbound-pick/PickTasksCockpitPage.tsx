// src/features/operations/outbound-pick/PickTasksCockpitPage.tsx
//
// 拣货任务 Cockpit（打印 → 扫码 → 核对/出库 收敛版）
// - 左：订单列表（参考入口）
// - 右：三段流水线：
//   ① 打印订单（显示 req_qty 订单要求，打印带订单确认码）
//   ② 扫码拣货（FEFO 批次 + 扫码写任务）
//   ③ 扫订单确认码核对 & 提交出库（commit）+ 提交后链路
//
// 裁决：
// - 右侧不再承载“创建拣货任务”入口
// - 右侧始终围绕“打印出来那张订单单据”同步展示

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

const PickTasksCockpitPage: React.FC = () => {
  const navigate = useNavigate();

  const [printOpen, setPrintOpen] = useState(false);

  // 左侧订单列表的“参考选中”（右侧只做展示同步，不负责创建任务）
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

  const pickedOrderLabel = useMemo(() => {
    if (!pickedOrder) return "未选择（左侧仅用于参考定位）";
    const plat = String(pickedOrder.platform ?? "").trim() || "-";
    const shop = String(pickedOrder.shop_id ?? "").trim() || "-";
    const ext = String(pickedOrder.ext_order_no ?? "").trim() || "-";
    return `${plat}/${shop} · ${ext}`;
  }, [pickedOrder]);

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">拣货</h1>
        <div className="text-[11px] text-slate-500">
          推荐流程：先打印订单 → 去扫码拣货 → 回来扫订单确认码核对 → 再 commit。
        </div>
      </header>

      {/* 左右 1:1 平分 */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* 左：订单列表（参考） */}
        <OrderPickSidebar onPickOrder={setPickedOrder} />

        {/* 右：执行流水线 */}
        <div className="space-y-6">
          {/* 顶部小摘要：同步“左侧参考订单 / 当前任务” */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[11px] text-slate-500">左侧参考订单</div>
                <div className="mt-1 font-mono text-[12px] text-slate-900">{pickedOrderLabel}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">当前执行任务</div>
                <div className="mt-1 font-mono text-[12px] text-slate-900">
                  {c.selectedTask ? `#${c.selectedTask.id} · WH ${c.selectedTask.warehouse_id}` : "未选择任务"}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {c.selectedTask ? `ref: ${c.selectedTask.ref ?? "-"}` : "请先选择一条拣货任务。"}
                </div>
              </div>
            </div>
          </section>

          {/* ① 打印订单（同步显示打印内容） */}
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">① 打印订单</h2>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:opacity-60"
                onClick={() => setPrintOpen(true)}
                disabled={!c.selectedTask}
                title={!c.selectedTask ? "请先选择任务" : ""}
              >
                打印订单拣货单
              </button>
            </div>

            <div className="text-[11px] text-slate-600">
              打印的是<strong>订单要求（req_qty）</strong>，拣货时按纸执行；最后扫订单确认码核对后才允许出库提交。
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

          {/* ② 扫码拣货：FEFO + Scan */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">② 扫码拣货</h2>

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

          {/* ③ 核对并提交出库 */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">③ 核对并提交出库</h2>

            <PickTaskCommitPanel
              task={c.selectedTask}
              allowDiff={c.allowDiff}
              onChangeAllowDiff={c.setAllowDiff}
              committing={c.commitBusy}
              commitError={c.commitError}
              platform={platform}
              shopId={shopId}
              onCommit={c.handleCommit}
            />

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-2 text-[11px] font-semibold text-slate-700">提交后链路</div>
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
