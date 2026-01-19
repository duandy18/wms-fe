// src/features/orders/OrderDetailPage.tsx
import React from "react";
import PageTitle from "../../components/ui/PageTitle";

import { useOrderDetailPage } from "./hooks/useOrderDetailPage";
import { OrderBasicsCard } from "./components/OrderBasicsCard";
import { OrderFactsTable } from "./components/OrderFactsTable";

const OrderDetailPage: React.FC = () => {
  const m = useOrderDetailPage();

  return (
    <div className="p-6 space-y-5">
      <PageTitle
        title={`订单详情 #${m.orderId}`}
        description="订单头信息、行事实（数量四件套）以及退货 / 对账 / 链路 / 库存 / 台账入口。"
      />

      <button
        type="button"
        className="mb-2 text-xs text-slate-600 hover:text-slate-900"
        onClick={m.backToList}
      >
        ← 返回订单列表
      </button>

      {m.loading && <div className="text-sm text-slate-500">加载中…</div>}
      {m.error && <div className="text-sm text-red-600">{m.error}</div>}

      {m.order && (
        <>
          <OrderBasicsCard
            order={m.order}
            traceId={m.traceId}
            hasRemainingRefundable={m.hasRemainingRefundable}
            reconcileLoading={m.reconcileLoading}
            creatingRma={m.creatingRma}
            onViewTrace={m.handleViewTrace}
            onReconcile={m.handleReconcile}
            onCreateRma={m.handleCreateRma}
            onViewLedger={m.handleViewLedger}
          />

          {m.facts && (
            <OrderFactsTable
              facts={m.facts}
              totals={m.totals}
              reconcile={m.reconcile}
              onViewStock={m.handleViewStock}
              onViewLedger={m.handleViewLedger}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
