// src/features/purchase-orders/detail/components/PurchaseOrderReadonlyPanel.tsx
// 拆分说明：从 PurchaseOrderViewPage.tsx 抽出详情页只读态信息区；页面层不再直接承载展示细节。

import React from "react";
import type { PurchaseOrderDetail } from "../../api";
import {
  formatPurchaseOrderMoney,
  formatPurchaseOrderTs,
} from "../utils";

interface PurchaseOrderReadonlyPanelProps {
  po: PurchaseOrderDetail;
  canEdit: boolean;
}

const PurchaseOrderReadonlyPanel: React.FC<PurchaseOrderReadonlyPanelProps> = ({
  po,
  canEdit,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900">
          采购单基本信息
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          状态：{po.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">采购单号</div>
          <div className="font-mono">{po.po_no || `PO-${po.id}`}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">供应商</div>
          <div>{po.supplier_name}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">仓库 ID</div>
          <div>{po.warehouse_id}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">采购人</div>
          <div>{po.purchaser}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">采购时间</div>
          <div>{formatPurchaseOrderTs(po.purchase_time)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">总金额</div>
          <div>{formatPurchaseOrderMoney(po.total_amount)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">创建时间</div>
          <div>{formatPurchaseOrderTs(po.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">最后收货</div>
          <div>{formatPurchaseOrderTs(po.last_received_at)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">关闭时间</div>
          <div>{formatPurchaseOrderTs(po.closed_at)}</div>
        </div>
      </div>

      <div
        className={[
          "rounded-lg px-4 py-3 text-sm",
          canEdit
            ? "border border-slate-200 bg-slate-50 text-slate-600"
            : "border border-amber-200 bg-amber-50 text-amber-900",
        ].join(" ")}
      >
        {canEdit
          ? "采购列表只负责浏览完成情况；采购单若允许修改，统一在本详情页进入编辑态。"
          : po.edit_block_reason
            ? `当前采购单只读：${po.edit_block_reason}`
            : "当前采购单只读。"}
      </div>

      {po.remark ? (
        <div>
          <div className="text-xs text-slate-500">备注</div>
          <div className="mt-1 text-sm text-slate-700">{po.remark}</div>
        </div>
      ) : null}
    </section>
  );
};

export default PurchaseOrderReadonlyPanel;
