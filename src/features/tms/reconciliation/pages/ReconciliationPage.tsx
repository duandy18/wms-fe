// src/features/tms/reconciliation/pages/ReconciliationPage.tsx

import React, { useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import {
  approveShippingBillReconciliation,
  reconcileShippingBill,
} from "../api";
import ApproveReconciliationDialog from "../components/ApproveReconciliationDialog";
import ReconciliationFilters from "../components/ReconciliationFilters";
import ReconciliationHistoryFilters from "../components/ReconciliationHistoryFilters";
import ReconciliationHistoryTable from "../components/ReconciliationHistoryTable";
import ReconciliationTable from "../components/ReconciliationTable";
import { useReconciliationHistoryList } from "../hooks/useReconciliationHistoryList";
import { useReconciliationList } from "../hooks/useReconciliationList";
import { useReconciliationCarrierOptions } from "../hooks/useReconciliationCarrierOptions";
import type {
  ApproveShippingBillReconciliationIn,
  ReconcileCarrierBillResult,
  ShippingBillReconciliationRow,
} from "../types";

function buildReconcileResultText(result: ReconcileCarrierBillResult): string {
  return `对账完成：${result.carrier_code} ｜ 账单 ${result.bill_item_count} ｜ 已平 ${result.matched_count} ｜ 我方缺记录 ${result.bill_only_count} ｜ 差异 ${result.diff_count} ｜ 更新 ${result.updated_count}`;
}

const ReconciliationPage: React.FC = () => {
  const current = useReconciliationList();
  const history = useReconciliationHistoryList();
  const carrierOptions = useReconciliationCarrierOptions();

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [approveTarget, setApproveTarget] = useState<ShippingBillReconciliationRow | null>(null);
  const [reconciling, setReconciling] = useState(false);

  // ✅ 新增：成功提示条
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function openApproveDialog(row: ShippingBillReconciliationRow): void {
    setApproveTarget(row);
  }

  function closeApproveDialog(): void {
    if (approvingId !== null) return;
    setApproveTarget(null);
  }

  async function handleApproveSubmit(payload: ApproveShippingBillReconciliationIn): Promise<void> {
    if (!approveTarget) return;

    try {
      setApprovingId(approveTarget.reconciliation_id);
      await approveShippingBillReconciliation(approveTarget.reconciliation_id, payload);
      setApproveTarget(null);
      await current.reload();
      await history.reload();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "确认失败";
      window.alert(msg);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReconcile(): Promise<void> {
    const carrierCode = (current.query.carrier_code ?? "").trim();
    if (!carrierCode) {
      window.alert("请先选择快递公司。");
      return;
    }

    try {
      setReconciling(true);

      const result = await reconcileShippingBill({
        carrier_code: carrierCode,
      });

      await current.reload();
      await history.reload();

      // ✅ 用绿条展示，不再 alert
      setSuccessMessage(buildReconcileResultText(result));

      // 自动消失（可选）
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "对账失败";
      window.alert(msg);
    } finally {
      setReconciling(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="运输对账"
        description="上方处理当前待确认对账表，下方查看已归档历史表。前后端字段和值严格 1:1 对齐。"
      />

      {/* ✅ 成功提示条 */}
      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          {successMessage}
        </div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div>
          <div className="text-base font-semibold text-slate-900">对账表</div>
          <div className="mt-1 text-sm text-slate-600">
            仅包含待处理记录：差异、我方缺记录。当前结果 {current.total} 条，第{" "}
            {current.currentPage} / {current.totalPages || 1} 页。
          </div>
        </div>

        <ReconciliationFilters
          query={current.query}
          loading={current.loading}
          carrierOptions={carrierOptions.options}
          carrierOptionsLoading={carrierOptions.loading}
          carrierOptionsError={carrierOptions.error}
          reconciling={reconciling}
          onChange={current.setField}
          onApply={() => void current.reload()}
          onReset={current.reset}
          onReconcile={handleReconcile}
        />

        <ReconciliationTable
          rows={current.rows}
          loading={current.loading}
          error={current.error}
          approvingId={approvingId}
          onApprove={openApproveDialog}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onClick={() =>
                current.setOffset(Math.max(0, current.query.offset - current.query.limit))
              }
              disabled={current.query.offset <= 0}
            >
              上一页
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              onClick={() => current.setOffset(current.query.offset + current.query.limit)}
              disabled={current.query.offset + current.query.limit >= current.total}
            >
              下一页
            </button>
          </div>
        </section>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div>
          <div className="text-base font-semibold text-slate-900">对账历史表</div>
          <div className="mt-1 text-sm text-slate-600">
            仅展示已归档快照：matched、approved_bill_only、resolved。当前结果 {history.total} 条，
            第 {history.currentPage} / {history.totalPages || 1} 页。
          </div>
        </div>

        <ReconciliationHistoryFilters
          query={history.query}
          loading={history.loading}
          carrierOptions={carrierOptions.options}
          carrierOptionsLoading={carrierOptions.loading}
          carrierOptionsError={carrierOptions.error}
          onChange={history.setField}
          onApply={() => void history.reload()}
          onReset={history.reset}
        />

        <ReconciliationHistoryTable
          rows={history.rows}
          loading={history.loading}
          error={history.error}
        />
      </section>

      <ApproveReconciliationDialog
        row={approveTarget}
        submitting={approvingId !== null}
        onCancel={closeApproveDialog}
        onSubmit={handleApproveSubmit}
      />
    </div>
  );
};

export default ReconciliationPage;
