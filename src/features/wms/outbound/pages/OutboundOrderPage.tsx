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

const OutboundOrderPage: React.FC = () => {
  const m = useOutboundOrderPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="订单出库" />

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
              label: `${order.ext_order_no} · ${order.platform} · ${order.shop_id}`,
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
                    {m.detail.order.platform} · {m.detail.order.shop_id}
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
              barcodeByLineId={m.barcodeByLineId}
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
              submitLabel="提交出库"
              showReloadList={false}
              onReloadList={m.reloadOrders}
              onReloadCurrent={m.reloadDetail}
              onSubmit={m.handleSubmitPlaceholder}
              reloadCurrentDisabled={!m.selectedOrder}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};

export default OutboundOrderPage;
