// src/features/tms/reconciliation/components/ApproveReconciliationDialog.tsx

import React, { useEffect, useState } from "react";
import type { ApproveShippingBillReconciliationIn, ShippingBillReconciliationRow } from "../types";

interface Props {
  row: ShippingBillReconciliationRow | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: ApproveShippingBillReconciliationIn) => void | Promise<void>;
}

function formatMoney(value: number | null): string {
  return value == null ? "-" : `￥${value.toFixed(2)}`;
}

const ApproveReconciliationDialog: React.FC<Props> = ({
  row,
  submitting,
  onCancel,
  onSubmit,
}) => {
  const [adjustAmountText, setAdjustAmountText] = useState("0");
  const [approvedReasonText, setApprovedReasonText] = useState("");

  useEffect(() => {
    if (!row) return;
    setAdjustAmountText(row.adjust_amount == null ? "0" : String(row.adjust_amount));
    setApprovedReasonText(row.approved_reason_text ?? "");
  }, [row]);

  if (!row) return null;

  const approvedReasonCode: ApproveShippingBillReconciliationIn["approved_reason_code"] =
    row.status === "diff" ? "resolved" : "approved_bill_only";

  const title = row.status === "diff" ? "确认已解决差异" : "确认账单上有，我方缺记录";
  const submitText = row.status === "diff" ? "确认已解决" : "确认我方缺记录";

  function parseAdjustAmount(text: string): number | null {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSubmit(): Promise<void> {
    const parsedAdjustAmount = parseAdjustAmount(adjustAmountText);
    if (parsedAdjustAmount == null) {
      window.alert("调整金额格式不正确，请输入数字。");
      return;
    }

    await onSubmit({
      approved_reason_code: approvedReasonCode,
      adjust_amount: parsedAdjustAmount,
      approved_reason_text: approvedReasonText.trim() ? approvedReasonText.trim() : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">
            本次确认将把当前记录归档到历史表，归档后不再更新。
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">当前状态</div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {row.status === "diff" ? "差异" : "账单上有，我方缺记录"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">最终结果 code</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{approvedReasonCode}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">最终结果</div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {row.status === "diff" ? "已解决" : "账单上有，我方缺记录"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">快递公司</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{row.carrier_code}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">运单号</div>
              <div className="mt-1 font-mono text-sm font-medium text-slate-900">{row.tracking_no}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">重量差</div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {row.weight_diff_kg == null ? "-" : String(row.weight_diff_kg)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">成本差</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{formatMoney(row.cost_diff)}</div>
            </div>
          </div>

          <label className="block space-y-1">
            <div className="text-sm font-medium text-slate-800">调整金额</div>
            <input
              value={adjustAmountText}
              onChange={(e) => setAdjustAmountText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="默认 0"
              disabled={submitting}
            />
            <div className="text-xs text-slate-500">用于归档快照写入 adjust_amount。</div>
          </label>

          <label className="block space-y-1">
            <div className="text-sm font-medium text-slate-800">备注</div>
            <textarea
              value={approvedReasonText}
              onChange={(e) => setApprovedReasonText(e.target.value)}
              className="min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="可选，写入 approved_reason_text"
              disabled={submitting}
            />
            <div className="text-xs text-slate-500">备注不是核心判定字段，只作为补充说明。</div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onCancel}
            disabled={submitting}
          >
            取消
          </button>

          <button
            type="button"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? "提交中…" : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveReconciliationDialog;
