import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingEditableBatchLines from "../../receiving/components/ReceivingEditableBatchLines";
import ReceivingScanFeedback from "../../receiving/components/ReceivingScanFeedback";
import ReceivingSubmitActions from "../../receiving/components/ReceivingSubmitActions";
import ReceivingSubmitFeedback from "../../receiving/components/ReceivingSubmitFeedback";
import { formatInboundStatus } from "../../../inbound-receipts/contracts/inboundReceipt";
import { formatReceivingStatus } from "../../receiving/contracts/receiving";
import { formatQty } from "../../receiving/utils/fixedRows";
import { useInventoryReturnInboundPage } from "../model/useInventoryReturnInboundPage";

import { formatDateTimeMinute } from "../../../../lib/dateTime";
function formatDateTime(value: string | null | undefined): string {
  return formatDateTimeMinute(value);
}

const InventoryReturnInboundPage: React.FC = () => {
  const m = useInventoryReturnInboundPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="退单入库"
        description="选择已出库且仍可退的订单，生成退单入库单，并在同页完成回仓执行。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">已出库订单选择区</div>
          <div className="text-xs text-slate-500">
            订单列表来自已出库且仍可退的事实订单，不再手输 order_key。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <label className="space-y-1 text-xs text-slate-600 xl:col-span-2">
            <span>已出库订单</span>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={m.selectedOrderRef}
              disabled={m.orderRefsLoading}
              onChange={(e) => m.selectOrderRef(e.target.value)}
            >
              <option value="">
                {m.orderRefsLoading ? "已出库订单加载中…" : "请选择已出库且仍可退的订单"}
              </option>
              {m.selectedOrderRef && !m.selectedOrderRefExistsInList ? (
                <option value={m.selectedOrderRef}>{m.selectedOrderRef}</option>
              ) : null}
              {m.orderRefs.map((row) => (
                <option key={row.order_ref} value={row.order_ref}>
                  {row.order_ref} · 剩余可退 {row.remaining_qty} · 最近出库{" "}
                  {formatDateTime(row.last_ship_at)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">剩余可退</div>
            <div className="text-sm text-slate-900">
              {m.orderDetail?.remaining_qty != null ? m.orderDetail.remaining_qty : "-"}
            </div>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                void m.refreshAll();
              }}
            >
              刷新订单列表
            </button>
          </div>
        </div>

        {m.orderRefsError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.orderRefsError}
          </div>
        ) : null}

        {m.orderDetail ? (
          <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-xs text-slate-500">平台</div>
              <div className="text-sm text-slate-900">{m.orderDetail.platform || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">店铺</div>
              <div className="text-sm text-slate-900">{m.orderDetail.shop_id || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">外部订单号</div>
              <div className="text-sm text-slate-900">{m.orderDetail.ext_order_no || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">订单键</div>
              <div className="text-sm text-slate-900 break-all">{m.orderDetail.order_ref}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">物流单号</div>
              <div className="text-sm text-slate-900">
                {m.orderDetail.shipping?.tracking_no || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">承运商</div>
              <div className="text-sm text-slate-900">
                {m.orderDetail.shipping?.carrier_name ||
                  m.orderDetail.shipping?.carrier_code ||
                  "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">发货时间</div>
              <div className="text-sm text-slate-900">
                {formatDateTime(m.orderDetail.shipping?.shipped_at)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">收货人</div>
              <div className="text-sm text-slate-900">
                {m.orderDetail.shipping?.receiver?.name || "-"}
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">来源明细区</div>
          <div className="text-xs text-slate-500">
            展示可退商品、已发数量、已退数量、剩余可退数量、本次生成数量。
          </div>
        </div>

        {m.sourceLoading ? (
          <div className="text-sm text-slate-500">正在加载来源明细…</div>
        ) : null}

        {m.sourceError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.sourceError}
          </div>
        ) : null}

        {m.source ? (
          <>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">来源仓库</div>
                <div className="text-sm text-slate-900">
                  {m.source.warehouse_name_snapshot || `仓库 ${m.source.warehouse_id}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">平台</div>
                <div className="text-sm text-slate-900">{m.source.platform || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">店铺</div>
                <div className="text-sm text-slate-900">{m.source.shop_id || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">剩余可退</div>
                <div className="text-sm text-slate-900">{formatQty(m.source.remaining_qty)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-center">生成</th>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">下单数量</th>
                    <th className="px-3 py-2 text-right">已发数量</th>
                    <th className="px-3 py-2 text-right">已退数量</th>
                    <th className="px-3 py-2 text-right">剩余可退数量</th>
                    <th className="px-3 py-2 text-right">本次生成数量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {m.source.lines.map((line) => (
                    <tr key={line.order_line_id}>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(m.selectedByLineId[line.order_line_id])}
                          disabled={m.creating || m.source?.existing_receipt_id != null}
                          onChange={(e) => {
                            m.setSelectedByLineId((prev) => ({
                              ...prev,
                              [line.order_line_id]: e.target.checked,
                            }));
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {line.item_name_snapshot || `商品 ${line.item_id}`}
                      </td>
                      <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                      <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(line.qty_ordered)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(line.qty_shipped)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(line.qty_returned)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(line.qty_remaining_refundable)}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-right font-mono"
                          value={m.qtyByLineId[line.order_line_id] ?? ""}
                          disabled={m.creating || m.source?.existing_receipt_id != null}
                          onChange={(e) => {
                            m.setQtyByLineId((prev) => ({
                              ...prev,
                              [line.order_line_id]: e.target.value,
                            }));
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="block space-y-1 text-xs text-slate-600">
              <span>整单备注</span>
              <textarea
                className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={m.receiptRemark}
                onChange={(e) => m.setReceiptRemark(e.target.value)}
                placeholder="退单入库单备注（可选）"
                disabled={m.creating || m.source?.existing_receipt_id != null}
              />
            </label>

            {m.createError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {m.createError}
              </div>
            ) : null}

            {m.createSuccess ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {m.createSuccess}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={m.creating || !m.source || m.source.existing_receipt_id != null}
                onClick={() => {
                  void m.createReceipt();
                }}
              >
                {m.creating
                  ? "生成中…"
                  : m.source.existing_receipt_id != null
                    ? "已存在退单入库单"
                    : "生成退单入库单"}
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            请先选择一个已出库且仍可退的订单。
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">当前退单入库单区</div>
          <div className="text-xs text-slate-500">
            若已存在单据则直接回显；若尚未发布，可在这里发布。
          </div>
        </div>

        {m.receiptLoading ? (
          <div className="text-sm text-slate-500">正在加载当前退单入库单…</div>
        ) : null}

        {!m.receiptLoading && !m.currentReceipt ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            当前还没有可展示的退单入库单。
          </div>
        ) : null}

        {m.currentReceipt ? (
          <>
            <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">退单入库单号</div>
                <div className="text-sm text-slate-900">{m.currentReceipt.receipt_no}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">状态</div>
                <div className="text-sm text-slate-900">
                  {formatInboundStatus(m.currentReceipt.status)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">来源单号</div>
                <div className="text-sm text-slate-900">
                  {m.currentReceipt.source_doc_no_snapshot || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">仓库</div>
                <div className="text-sm text-slate-900">
                  {m.currentReceipt.warehouse_name_snapshot ||
                    `仓库 ${m.currentReceipt.warehouse_id}`}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">对方</div>
                <div className="text-sm text-slate-900">
                  {m.currentReceipt.counterparty_name_snapshot || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">发布时间</div>
                <div className="text-sm text-slate-900">
                  {formatDateTime(m.currentReceipt.released_at)}
                </div>
              </div>
              <div className="md:col-span-2 xl:col-span-2">
                <div className="text-xs text-slate-500">备注</div>
                <div className="text-sm text-slate-900">
                  {m.currentReceipt.remark || "-"}
                </div>
              </div>
            </section>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left">商品</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-right">计划数量</th>
                    <th className="px-3 py-2 text-right">累计已收</th>
                    <th className="px-3 py-2 text-right">剩余待收</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {m.currentReceipt.lines.map((line) => {
                    const progress = m.progressByLineNo.get(line.line_no);
                    return (
                      <tr key={line.id}>
                        <td className="px-3 py-2">
                          {line.item_name_snapshot || `商品 ${line.item_id}`}
                        </td>
                        <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                        <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(line.planned_qty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(progress?.received_qty)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {formatQty(progress?.remaining_qty)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {m.releaseError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {m.releaseError}
              </div>
            ) : null}

            {m.releaseSuccess ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {m.releaseSuccess}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                disabled={m.receiptLoading}
                onClick={() => {
                  void m.refreshAll();
                }}
              >
                刷新当前单据
              </button>
              <button
                type="button"
                className="rounded-md border border-indigo-300 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                disabled={
                  m.releaseLoading ||
                  m.currentReceipt.status === "RELEASED" ||
                  m.currentReceipt.status === "COMPLETED"
                }
                onClick={() => {
                  void m.releaseReceipt();
                }}
              >
                {m.releaseLoading
                  ? "发布中…"
                  : m.currentReceipt.status === "RELEASED"
                    ? "已发布"
                    : m.currentReceipt.status === "COMPLETED"
                      ? "已完成"
                      : "发布退单入库单"}
              </button>
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">执行区</div>
          <div className="text-xs text-slate-500">
            单据发布后，在同页直接完成回仓执行，不再跳独立 receiving 页面。
          </div>
        </div>

        {!m.currentReceipt ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            请先生成退单入库单。
          </div>
        ) : !m.currentReceiptReleasedOrCompleted ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            当前单据还是草稿，请先在上方发布退单入库单。
          </div>
        ) : m.receivingTaskLoading ? (
          <div className="text-sm text-slate-500">正在加载回仓执行区…</div>
        ) : m.receivingTaskError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.receivingTaskError}
          </div>
        ) : m.receivingTask ? (
          <>
            <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">执行单号</div>
                <div className="text-sm text-slate-900">{m.receivingTask.receipt_no}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">执行状态</div>
                <div className="text-sm text-slate-900">
                  {formatReceivingStatus(m.receivingTask.status)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">来源类型</div>
                <div className="text-sm text-slate-900">{m.receivingTask.source_type}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">仓库</div>
                <div className="text-sm text-slate-900">
                  {m.receivingTask.warehouse_name_snapshot ||
                    `仓库 ${m.receivingTask.warehouse_id}`}
                </div>
              </div>
            </section>

            <label className="block space-y-1 text-xs text-slate-600">
              <span>执行备注</span>
              <textarea
                className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                value={m.executionRemark}
                onChange={(e) => m.setExecutionRemark(e.target.value)}
                placeholder="本次回仓整单备注（可选）"
                disabled={m.executionInteractionDisabled}
              />
            </label>

            <ReceivingScanFeedback
              scanError={m.scanError}
              scanSuccess={m.scanSuccess}
            />

            <ReceivingEditableBatchLines
              lines={m.receivingTask.lines}
              entriesByLineNo={m.entriesByLineNo}
              uomOptionsByLineNo={m.uomOptionsByLineNo}
              resolvingEntryKey={m.resolvingEntryKey}
              interactionDisabled={m.executionInteractionDisabled}
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
              refreshLabel="刷新执行区"
              submitLabel={
                m.currentReceipt.status === "COMPLETED" ? "已完成" : "提交回仓执行"
              }
              submitting={m.submitting}
              refreshDisabled={m.receivingTaskLoading || m.submitting}
              submitDisabled={!m.canSubmit}
              onRefresh={() => {
                void m.refreshAll();
              }}
              onSubmit={() => {
                if (!window.confirm(`确认提交回仓执行：${m.receivingTask?.receipt_no}？`)) {
                  return;
                }
                void m.submitExecution();
              }}
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            当前单据尚未形成可执行任务。
          </div>
        )}
      </section>
    </div>
  );
};

export default InventoryReturnInboundPage;
