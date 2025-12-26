// src/features/orders/page/components/OrdersListCard.tsx

import React, { useMemo } from "react";
import { StandardTable, type ColumnDef } from "../../../../components/wmsdu/StandardTable";
import type { OrderSummary } from "../../api";
import { UI } from "../ui";
import { formatTs, statusPillClass } from "../utils";

function renderStatus(status?: string | null) {
  if (!status) return <span className={statusPillClass(null)}>-</span>;
  return <span className={statusPillClass(status)}>{status}</span>;
}

export const OrdersListCard: React.FC<{
  rows: OrderSummary[];
  loading: boolean;
  onOpenDetail: (r: OrderSummary) => void;
}> = ({ rows, loading, onOpenDetail }) => {
  const columns: ColumnDef<OrderSummary>[] = useMemo(
    () => [
      { key: "platform", header: "平台", render: (r) => r.platform },
      { key: "shop_id", header: "店铺", render: (r) => r.shop_id },
      {
        key: "ext_order_no",
        header: "外部订单号",
        render: (r) => <span className={UI.mono11}>{r.ext_order_no}</span>,
      },
      { key: "status", header: "状态", render: (r) => renderStatus(r.status) },
      {
        key: "amount",
        header: "金额 / 实付",
        align: "right",
        render: (r) => (
          <span className={UI.mono11}>
            {r.order_amount ?? "-"} / {r.pay_amount ?? "-"}
          </span>
        ),
      },
      { key: "warehouse_id", header: "仓库", render: (r) => r.warehouse_id ?? "-" },
      { key: "created_at", header: "创建时间", render: (r) => formatTs(r.created_at) },
      {
        key: "actions",
        header: "操作",
        render: (r) => (
          <button type="button" className="text-xs text-sky-700 hover:underline" onClick={() => void onOpenDetail(r)}>
            查看详情
          </button>
        ),
      },
    ],
    [onOpenDetail],
  );

  return (
    <section className={UI.listCard}>
      <StandardTable<OrderSummary>
        columns={columns}
        data={rows}
        dense
        getRowKey={(r) => r.id}
        emptyText={loading ? "加载中…" : "暂无订单，可以先在 DevConsole 或平台回放生成一些订单。"}
        footer={<span className={UI.hint}>共 {rows.length} 条记录（当前页）</span>}
      />
    </section>
  );
};

export default OrdersListCard;
