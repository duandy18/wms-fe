import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import OutboundOrderEditableLines from "../components/OutboundOrderEditableLines";
import OutboundSourceSelect from "../components/OutboundSourceSelect";
import OutboundSubmitActions from "../components/OutboundSubmitActions";
import OutboundSubmitFeedback from "../components/OutboundSubmitFeedback";
import { formatDateTime, formatMaybeMoney } from "../contracts/outbound";
import { useOutboundOrderPage } from "../model/useOutboundOrderPage";

function warehouseLabel(item: { id: number; name: string; code?: string | null }) {
  const code =
    typeof item.code === "string" && item.code.trim() ? item.code.trim() : "";
  return code ? `${item.name}（${code}）` : item.name;
}

function formatImportStatus(value: string): string {
  switch (value) {
    case "IMPORTED":
      return "已接入";
    case "NOT_IMPORTED":
      return "待接入";
    default:
      return value || "-";
  }
}

const OutboundOrderPage: React.FC = () => {
  const m = useOutboundOrderPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="订单出库" />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              OMS 待接入订单
            </div>
            <div className="text-xs text-slate-500">
              从 OMS 履约投影接入为 WMS 出库订单；已接入后可直接在下方订单中选择。
            </div>
          </div>

          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-60"
            onClick={m.reloadOmsCandidates}
            disabled={m.omsCandidatesLoading}
          >
            {m.omsCandidatesLoading ? "刷新中…" : "刷新待接入订单"}
          </button>
        </div>

        {m.omsCandidatesError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.omsCandidatesError}
          </div>
        ) : null}

        {m.omsImportMessage ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {m.omsImportMessage}
          </div>
        ) : null}

        {m.omsCandidates.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            暂无 OMS 待接入订单。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">平台订单</th>
                  <th className="px-3 py-2 text-left font-medium">店铺</th>
                  <th className="px-3 py-2 text-left font-medium">收件人</th>
                  <th className="px-3 py-2 text-right font-medium">组件数</th>
                  <th className="px-3 py-2 text-left font-medium">状态</th>
                  <th className="px-3 py-2 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {m.omsCandidates.map((candidate) => {
                  const isImporting =
                    m.importingReadyOrderId === candidate.ready_order_id;

                  return (
                    <tr key={candidate.ready_order_id}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">
                          {candidate.platform_order_no}
                        </div>
                        <div className="text-xs text-slate-500">
                          {candidate.platform} · {candidate.ready_order_id}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>{candidate.store_code}</div>
                        <div className="text-xs text-slate-500">
                          {candidate.store_name || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <div>{candidate.receiver_name || "-"}</div>
                        <div className="text-xs text-slate-500">
                          {candidate.receiver_phone || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {candidate.component_count}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {formatImportStatus(candidate.import_status)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {candidate.imported_order_id ? (
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                            onClick={() =>
                              m.selectOrderId(String(candidate.imported_order_id))
                            }
                          >
                            选择订单 #{candidate.imported_order_id}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() =>
                              m.importOmsCandidate(candidate.ready_order_id)
                            }
                            disabled={!candidate.can_import || isImporting}
                          >
                            {isImporting ? "导入中…" : "导入为出库订单"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">订单出库输入</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <OutboundSourceSelect
            label="订单"
            value={m.selectedOrderId}
            disabled={m.ordersLoading}
            placeholder={m.ordersLoading ? "订单加载中…" : "请选择订单"}
            options={m.orders.map((order) => ({
              key: order.id,
              value: String(order.id),
              label: `${order.ext_order_no} · ${order.platform} · ${order.store_code}`,
            }))}
            onChange={m.selectOrderId}
          />

          <OutboundSourceSelect
            label="执行仓库"
            value={m.selectedWarehouseId}
            disabled={m.warehousesLoading}
            placeholder={m.warehousesLoading ? "仓库加载中…" : "请选择执行仓库"}
            options={m.warehouses.map((warehouse) => ({
              key: warehouse.id,
              value: String(warehouse.id),
              label: warehouseLabel(warehouse),
            }))}
            onChange={m.selectWarehouseId}
          />
        </div>

        {m.ordersError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.ordersError}
          </div>
        ) : null}

        {m.warehousesError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.warehousesError}
          </div>
        ) : null}

        {!m.selectedOrderId ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先选择订单。
          </div>
        ) : null}

        {m.detailLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在展开订单出库单…
          </div>
        ) : null}

        {m.detailError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.detailError}
          </div>
        ) : null}

        {m.detail ? (
          <>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
                订单头参考
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-xs text-slate-500">订单号</div>
                  <div className="text-sm text-slate-900">
                    {m.detail.order.ext_order_no}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">平台 / 店铺</div>
                  <div className="text-sm text-slate-900">
                    {m.detail.order.platform} · {m.detail.order.store_code}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">状态</div>
                  <div className="text-sm text-slate-900">
                    {m.detail.order.status || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">买家</div>
                  <div className="text-sm text-slate-900">
                    {m.detail.order.buyer_name || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">手机号</div>
                  <div className="text-sm text-slate-900">
                    {m.detail.order.buyer_phone || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">订单金额</div>
                  <div className="text-sm text-slate-900">
                    {formatMaybeMoney(m.detail.order.order_amount)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">实付金额</div>
                  <div className="text-sm text-slate-900">
                    {formatMaybeMoney(m.detail.order.pay_amount)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">创建时间</div>
                  <div className="text-sm text-slate-900">
                    {formatDateTime(m.detail.order.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <OutboundOrderEditableLines
              lines={m.detail.lines}
              warehouseSelected={Boolean(m.selectedWarehouse)}
              barcodeByLineId={m.barcodeByLineId}
              submitLocked={m.isSubmitting}
              qtyByLineId={m.qtyByLineId}
              hintByLineId={m.lineHintByLineId}
              resolvedByLineId={m.resolvedByLineId}
              lotCandidatesByLineId={m.lotCandidatesByLineId}
              selectedLotByLineId={m.selectedLotByLineId}
              resolvingLineId={m.resolvingLineId}
              onChangeBarcode={m.updateBarcode}
              onResolveBarcode={m.resolveBarcode}
              onChangeQty={m.updateQty}
              onSelectLot={m.selectLot}
            />

            <OutboundSubmitFeedback message={m.submitMessage} />

            <OutboundSubmitActions
              summaryText={`当前已录入 ${m.enteredLinesCount} 条本次出库数量。`}
              reloadCurrentLabel="刷新当前订单"
              submitLabel={m.isSubmitting ? "提交中…" : "提交出库"}
              showReloadList={false}
              onReloadList={m.reloadOrders}
              onReloadCurrent={m.reloadDetail}
              onSubmit={m.handleSubmitPlaceholder}
              reloadCurrentDisabled={!m.selectedOrder || m.isSubmitting}
              submitDisabled={!m.canSubmit}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default OutboundOrderPage;
