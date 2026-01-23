// src/features/orders/components/inline-detail/OrderInlineDetailMetaGrid.tsx
import React from "react";
import { formatTs, renderFulfillmentStatus, renderStatus } from "../../ui/format";

function whText(id: number | null | undefined) {
  if (id == null) return "-";
  return `WH${id}`;
}

export const OrderInlineDetailMetaGrid: React.FC<{
  order: {
    platform: string;
    shop_id: string;
    ext_order_no: string;
    status?: string | null;
    warehouse_id?: number | null;
    created_at?: string | null;
    order_amount?: number | null;
    pay_amount?: number | null;
  };
  fulfillmentStatus: string | null;
  serviceWarehouseId: number | null;
  execWarehouseId: number | null;
}> = ({ order, fulfillmentStatus, serviceWarehouseId, execWarehouseId }) => {
  return (
    <div className="grid grid-cols-1 gap-y-2 text-xs md:grid-cols-3 md:gap-x-8">
      <div>
        <div className="text-[11px] text-slate-500">平台 / 店铺</div>
        <div>
          {order.platform}/{order.shop_id}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">外部订单号</div>
        <div className="font-mono text-[11px]">{order.ext_order_no}</div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">发货状态</div>
        <div>{fulfillmentStatus ? renderFulfillmentStatus(fulfillmentStatus) : renderStatus(order.status)}</div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">服务归属仓</div>
        <div className="font-mono text-[11px]">
          {serviceWarehouseId != null ? whText(serviceWarehouseId) : "-"}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">执行出库仓</div>
        <div className="font-mono text-[11px]">
          {execWarehouseId != null ? whText(execWarehouseId) : "尚未指定"}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">创建时间</div>
        <div>{formatTs(order.created_at)}</div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">金额 / 实付</div>
        <div className="font-mono text-[11px]">
          {order.order_amount ?? "-"} / {order.pay_amount ?? "-"}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">状态（业务流程）</div>
        <div>{renderStatus(order.status)}</div>
      </div>

      <div>
        <div className="text-[11px] text-slate-500">仓库 ID（旧字段）</div>
        <div>{order.warehouse_id ?? "-"}</div>
      </div>
    </div>
  );
};
