import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageTitle from "../../../../components/ui/PageTitle";
import OutboundExecutionEditableLines from "../components/OutboundExecutionEditableLines";
import OutboundExecutionInfoCard from "../components/OutboundExecutionInfoCard";
import OutboundSourceSelect from "../components/OutboundSourceSelect";
import OutboundSubmitActions from "../components/OutboundSubmitActions";
import OutboundSubmitFeedback from "../components/OutboundSubmitFeedback";
import {
  formatDateTime,
  formatManualOutboundDocStatus,
} from "../contracts/outbound";
import { useOutboundManualPage } from "../model/useOutboundManualPage";

const OutboundManualPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const m = useOutboundManualPage();
  const {
    rows,
    loading,
    error,
    selectedDocId,
    selectDocId,
    detail,
    detailLoading,
    detailError,
    barcodeByLineId,
    qtyByLineId,
    lineHintByLineId,
    resolvedByLineId,
    lotCandidatesByLineId,
    selectedLotByLineId,
    resolvingLineId,
    updateBarcode,
    resolveBarcode,
    updateQty,
    selectLot,
    submitMessage,
    enteredLinesCount,
    canSubmit,
    isSubmitting,
    reload,
    reloadDetail,
    handleSubmit,
  } = m;

  useEffect(() => {
    const docId = searchParams.get("docId") || "";
    if (!docId) return;
    if (selectedDocId === docId) return;
    if (rows.length === 0) return;

    const hit = rows.find((row) => String(row.id) === docId);
    if (!hit) return;

    selectDocId(docId);
  }, [rows, selectedDocId, selectDocId, searchParams]);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动出库"
        description="消费已发布手动出库单据，完成扫码识别、lot 选择与真实提交。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">
          手动出库执行输入
        </div>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <OutboundSourceSelect
          label="已发布手动出库单据"
          value={selectedDocId}
          disabled={loading}
          placeholder={loading ? "单据加载中…" : "请选择已发布手动出库单据"}
          options={rows.map((row) => ({
            key: row.id,
            value: String(row.id),
            label: `${row.doc_no} · 仓库 ${row.warehouse_id} · ${row.recipient_name || "-"}`,
          }))}
          onChange={selectDocId}
        />

        {!selectedDocId ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先选择已发布手动出库单据。
          </div>
        ) : null}

        {detailLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载手动出库详情…
          </div>
        ) : null}

        {detailError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {detailError}
          </div>
        ) : null}

        {detail ? (
          <>
            <OutboundExecutionInfoCard
              title="单头参考"
              items={[
                { label: "单据号", value: detail.doc_no },
                {
                  label: "状态",
                  value: formatManualOutboundDocStatus(detail.status),
                },
                { label: "执行仓库", value: `仓库 ${detail.warehouse_id}` },
                { label: "领用 / 收件人", value: detail.recipient_name || "-" },
                {
                  label: "发布时间",
                  value: formatDateTime(detail.released_at),
                },
                {
                  label: "单据备注",
                  value: detail.remark || "-",
                },
              ]}
            />

            <OutboundExecutionEditableLines
              lines={detail.lines.map((line) => ({
                id: line.id,
                lineNo: line.line_no,
                itemId: line.item_id,
                itemName: line.item_name_snapshot,
                itemSku: line.item_sku_snapshot,
                itemSpec: line.item_spec_snapshot,
                uomName: line.uom_name_snapshot,
                plannedQty: line.requested_qty,
              }))}
              emptyText="当前单据暂无出库行"
              submitLocked={isSubmitting}
              barcodeByLineId={barcodeByLineId}
              qtyByLineId={qtyByLineId}
              hintByLineId={lineHintByLineId}
              resolvedByLineId={resolvedByLineId}
              lotCandidatesByLineId={lotCandidatesByLineId}
              selectedLotByLineId={selectedLotByLineId}
              resolvingLineId={resolvingLineId}
              onChangeBarcode={updateBarcode}
              onResolveBarcode={resolveBarcode}
              onChangeQty={updateQty}
              onSelectLot={selectLot}
            />

            <OutboundSubmitFeedback message={submitMessage} />

            <OutboundSubmitActions
              summaryText={`当前已录入 ${enteredLinesCount} 条本次出库数量。`}
              reloadCurrentLabel="刷新当前单据"
              submitLabel={isSubmitting ? "提交中…" : "提交出库"}
              onReloadList={reload}
              onReloadCurrent={reloadDetail}
              onSubmit={handleSubmit}
              reloadCurrentDisabled={!selectedDocId || detailLoading || isSubmitting}
              submitDisabled={!canSubmit}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default OutboundManualPage;
