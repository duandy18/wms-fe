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

  useEffect(() => {
    const docId = searchParams.get("docId") || "";
    if (!docId) return;
    if (m.selectedDocId === docId) return;
    if (m.rows.length === 0) return;

    const hit = m.rows.find((row) => String(row.id) === docId);
    if (!hit) return;

    m.selectDocId(docId);
  }, [m, m.rows, m.selectedDocId, searchParams]);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="手动出库"
        description="消费已发布手动出库单据的执行页；本页先完成真实来源读取、扫码框与录数结构。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">
          手动出库执行输入
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        <OutboundSourceSelect
          label="已发布手动出库单据"
          value={m.selectedDocId}
          disabled={m.loading}
          placeholder={m.loading ? "单据加载中…" : "请选择已发布手动出库单据"}
          options={m.rows.map((row) => ({
            key: row.id,
            value: String(row.id),
            label: `${row.doc_no} · 仓库 ${row.warehouse_id} · ${row.recipient_name || "-"}`,
          }))}
          onChange={m.selectDocId}
        />

        {!m.selectedDocId ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先选择已发布手动出库单据。
          </div>
        ) : null}

        {m.detailLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载手动出库详情…
          </div>
        ) : null}

        {m.detailError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.detailError}
          </div>
        ) : null}

        {m.detail ? (
          <>
            <OutboundExecutionInfoCard
              title="单头参考"
              items={[
                { label: "单据号", value: m.detail.doc_no },
                {
                  label: "状态",
                  value: formatManualOutboundDocStatus(m.detail.status),
                },
                { label: "仓库", value: `仓库 ${m.detail.warehouse_id}` },
                { label: "领用/收件人", value: m.detail.recipient_name || "-" },
                {
                  label: "发布时间",
                  value: formatDateTime(m.detail.released_at),
                },
              ]}
            />

            <OutboundExecutionEditableLines
              refLabelName="line_no"
              lines={m.detail.lines.map((line) => ({
                key: line.id,
                refLabel: String(line.line_no),
                itemId: line.item_id,
                plannedQty: line.requested_qty,
                barcodeValue: m.barcodeByLineId[line.id] ?? "",
                qtyValue: m.qtyByLineId[line.id] ?? "",
                hint: m.lineHintByLineId[line.id] ?? "",
              }))}
              emptyText="当前单据暂无行"
              onChangeBarcode={m.updateBarcode}
              onResolveBarcode={m.resolveBarcodePlaceholder}
              onChangeQty={m.updateQty}
            />

            <OutboundSubmitFeedback message={m.submitMessage} />

            <OutboundSubmitActions
              summaryText={`当前已录入 ${m.enteredLinesCount} 条本次出库数量。`}
              onReloadList={m.reload}
              onReloadCurrent={m.reloadDetail}
              onSubmit={m.handleSubmitPlaceholder}
              reloadCurrentDisabled={!m.selectedDocId}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default OutboundManualPage;
