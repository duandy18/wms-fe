import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingEditableBatchLines from "../components/ReceivingEditableBatchLines";
import ReceivingReceiptSelect from "../components/ReceivingReceiptSelect";
import ReceivingScanFeedback from "../components/ReceivingScanFeedback";
import ReceivingSubmitActions from "../components/ReceivingSubmitActions";
import ReceivingSubmitFeedback from "../components/ReceivingSubmitFeedback";
import { useReceivingFixedRowsReceiptPage } from "../model/useReceivingFixedRowsReceiptPage";

const ReceivingPurchasePage: React.FC = () => {
  const m = useReceivingFixedRowsReceiptPage({
    sourceType: "PURCHASE_ORDER",
    scanMissingSelectionMessage: "请先选择采购收货单，再进行识别",
    submitMissingSelectionMessage: "请先选择采购收货单",
    submitFailedFallback: "提交采购单收货失败",
  });

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="采购单收货" />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">
          采购收货输入
        </div>

        <ReceivingReceiptSelect
          label="采购收货单"
          value={m.selectedReceiptNo}
          disabled={m.loading}
          placeholder={m.loading ? "收货单加载中…" : "请选择采购收货单"}
          options={m.rows.map((row) => ({
            key: row.receipt_id,
            value: row.receipt_no,
            label: `${row.receipt_no} · ${row.source_doc_no_snapshot || "-"} · ${
              row.counterparty_name_snapshot || "未知供应商"
            }`,
          }))}
          onChange={m.selectReceiptNo}
        />

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        {!m.selectedReceiptNo ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先选择采购收货单。
          </div>
        ) : null}

        {m.selectedReceiptNo &&
        m.detailLoadingByReceiptNo[m.selectedReceiptNo] ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在展开采购收货单…
          </div>
        ) : null}

        {m.selectedReceiptNo &&
        m.detailErrorByReceiptNo[m.selectedReceiptNo] ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.detailErrorByReceiptNo[m.selectedReceiptNo]}
          </div>
        ) : null}

        {m.selectedDetail ? (
          <>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                单头参考
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <div className="text-xs text-slate-500">收货单号</div>
                  <div className="text-sm text-slate-900">
                    {m.selectedDetail.receipt_no}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">来源单号</div>
                  <div className="text-sm text-slate-900">
                    {m.selectedDetail.source_doc_no_snapshot || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">仓库</div>
                  <div className="text-sm text-slate-900">
                    {m.selectedDetail.warehouse_name_snapshot ||
                      `仓库 ${m.selectedDetail.warehouse_id}`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">供应商</div>
                  <div className="text-sm text-slate-900">
                    {m.selectedDetail.counterparty_name_snapshot || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">备注</div>
                  <div className="text-sm text-slate-900">
                    {m.selectedDetail.remark || "-"}
                  </div>
                </div>
              </div>
            </div>

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
              showRemarkField={false}
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
              submitLabel="提交采购单收货"
              submitting={m.submitting}
              refreshDisabled={m.submitting}
              submitDisabled={m.submitting}
              onRefresh={m.refreshCurrent}
              onSubmit={() => {
                void m.submit();
              }}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default ReceivingPurchasePage;
