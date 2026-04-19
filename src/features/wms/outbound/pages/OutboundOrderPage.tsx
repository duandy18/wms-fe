import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import OutboundExecutionInfoCard from "../components/OutboundExecutionInfoCard";
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
      <PageTitle
        title="订单出库"
        description="参考采购收货页：一张主卡完成选单、看单、扫码识别与录入实际出库数量。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">订单出库输入</div>

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
            onChange={m.setSelectedWarehouseId}
          />
        </div>

        {!m.selectedOrderId ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            请先选择订单，再展开订单出库主卡。
          </div>
        ) : null}

        {m.detailLoading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            正在加载订单出库视图…
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
              title="订单头参考"
              items={[
                { label: "订单号", value: m.detail.order.ext_order_no },
                {
                  label: "平台/店铺",
                  value: `${m.detail.order.platform} · ${m.detail.order.shop_id}`,
                },
                { label: "状态", value: m.detail.order.status || "-" },
                { label: "买家", value: m.detail.order.buyer_name || "-" },
                { label: "手机号", value: m.detail.order.buyer_phone || "-" },
                {
                  label: "订单金额",
                  value: formatMaybeMoney(m.detail.order.order_amount),
                },
                {
                  label: "实付金额",
                  value: formatMaybeMoney(m.detail.order.pay_amount),
                },
                {
                  label: "创建时间",
                  value: formatDateTime(m.detail.order.created_at),
                },
              ]}
            />

            <OutboundOrderEditableLines
              lines={m.detail.lines}
              barcodeByLineId={m.barcodeByLineId}
              qtyByLineId={m.qtyByLineId}
              hintByLineId={m.lineHintByLineId}
              resolvedByLineId={m.resolvedByLineId}
              resolvingLineId={m.resolvingLineId}
              onChangeBarcode={m.updateBarcode}
              onResolveBarcode={m.resolveBarcode}
              onChangeQty={m.updateQty}
            />

            <OutboundSubmitFeedback message={m.submitMessage} />

            <OutboundSubmitActions
              summaryText={`当前已录入 ${m.enteredLinesCount} 条本次出库数量。`}
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
