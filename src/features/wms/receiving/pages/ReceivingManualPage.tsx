import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import ReceivingReceiptSelect from "../components/ReceivingReceiptSelect";
import ReceivingScanFeedback from "../components/ReceivingScanFeedback";
import ReceivingSubmitActions from "../components/ReceivingSubmitActions";
import ReceivingSubmitFeedback from "../components/ReceivingSubmitFeedback";
import {
  formatReceivingSourceType,
  formatReceivingStatus,
} from "../contracts/receiving";
import { useReceivingFixedRowsReceiptPage } from "../model/useReceivingFixedRowsReceiptPage";

import { formatDateTimeMinute } from "../../../../lib/dateTime";
function formatDateTime(value: string | null): string {
  return formatDateTimeMinute(value);
}

const ReceivingManualPage: React.FC = () => {
  const m = useReceivingFixedRowsReceiptPage({
    sourceType: "MANUAL",
    scanMissingSelectionMessage: "请先选择手动收货单，再进行识别",
    submitMissingSelectionMessage: "请先选择手动收货单",
    submitFailedFallback: "提交手动收货失败",
  });

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动收货"
        description="上卡选择手动来源的已发布收货单，并直接录入本次收货数量、批次、生产日期等。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">收货录入</div>
          <div className="text-xs text-slate-500">
            先选择手动收货单。系统会展开该收货单的收货行，并在上卡直接补录本次数量、批次号、生产日期、到期日期和备注。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReceivingReceiptSelect
            label="手动收货单"
            value={m.selectedReceiptNo}
            disabled={m.loading}
            placeholder={m.loading ? "收货单加载中…" : "请选择手动收货单"}
            options={m.rows.map((row) => ({
              key: row.receipt_id,
              value: row.receipt_no,
              label: `${row.receipt_no} · ${
                row.counterparty_name_snapshot || "手动来源"
              }`,
            }))}
            onChange={m.selectReceiptNo}
            className="xl:col-span-2"
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">来源</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow ? formatReceivingSourceType(m.selectedRow.source_type) : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">状态</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow ? formatReceivingStatus(m.selectedRow.status) : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">收货单号</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow?.receipt_no || "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">仓库</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow
                ? m.selectedRow.warehouse_name_snapshot || `仓库 ${m.selectedRow.warehouse_id}`
                : "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">对方</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow?.counterparty_name_snapshot || "-"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">发布时间</div>
            <div className="text-sm text-slate-900">
              {m.selectedRow ? formatDateTime(m.selectedRow.released_at) : "-"}
            </div>
          </div>
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        {m.selectedReceiptNo ? (
          <section className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">本次收货录入</div>

            {m.detailLoadingByReceiptNo[m.selectedReceiptNo] ? (
              <div className="text-sm text-slate-500">正在展开收货单…</div>
            ) : null}

            {m.detailErrorByReceiptNo[m.selectedReceiptNo] ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {m.detailErrorByReceiptNo[m.selectedReceiptNo]}
              </div>
            ) : null}

            {m.selectedDetail ? (
              <>
                <label className="block space-y-1 text-xs text-slate-600">
                  <span>整单备注</span>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    value={m.remark}
                    onChange={(e) => m.setRemark(e.target.value)}
                    placeholder="本次收货整单备注（可选）"
                  />
                </label>

                <ReceivingScanFeedback
                  scanError={m.scanError}
                  scanSuccess={m.scanSuccess}
                />

                <ReceivingEditableBatchLines
                  lines={m.selectedDetail.lines}
                  entriesByLineNo={m.entriesByLineNo}
                  uomOptionsByLineNo={m.uomOptionsByLineNo}
                  resolvingEntryKey={m.resolvingEntryKey}
                  onResolveBarcode={m.resolveBarcodeAtEntry}
                  showRemarkField={true}
                  showLineHint={false}
                  fixedRowsByUom={true}
                  onChangeEntry={m.updateEntry}
                />

                <ReceivingSubmitFeedback
                  submitError={m.submitError}
                  submitSuccess={m.submitSuccess}
                  lastSubmit={m.lastSubmit}
                />

                <ReceivingSubmitActions
                  refreshLabel="刷新当前收货单"
                  submitLabel="提交手动收货"
                  submitting={m.submitting}
                  refreshDisabled={m.submitting}
                  submitDisabled={m.submitting || !m.canSubmit}
                  onRefresh={m.refreshCurrent}
                  onSubmit={() => {
                    void m.submit();
                  }}
                />
              </>
            ) : null}
          </section>
        ) : null}
      </section>
    </div>
  );
};

export default ReceivingManualPage;
