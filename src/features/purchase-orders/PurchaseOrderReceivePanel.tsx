// src/features/purchase-orders/PurchaseOrderReceivePanel.tsx

import React from "react";
import type { PurchaseOrderDetail, PurchaseOrderDetailLine } from "./api";

interface PurchaseOrderReceivePanelProps {
  po: PurchaseOrderDetail;
  selectedLine: PurchaseOrderDetailLine | null;
  selectedLineId: number | null;
  receiveQty: string;
  receiving: boolean;
  remainingOfSelected: number | null;
  receiveError: string | null;
  onChangeSelectedLineId: (lineId: number | null) => void;
  onChangeReceiveQty: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PurchaseOrderReceivePanel: React.FC<PurchaseOrderReceivePanelProps> = ({
  po,
  receiveError,
}) => {
  return (
    <section className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-amber-800">采购页收货入口已退役</h2>
        {receiveError && <div className="text-xs text-red-600">{receiveError}</div>}
      </div>

      <div className="text-sm text-slate-700 leading-6">
        当前采购页不再承载“行级收货”作业。采购模块负责：
        <span className="font-medium">计划、完成情况、事实回看</span>；
        收货作业应迁移到统一收货页。
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 space-y-1">
        <div>采购单号：{po.po_no || `PO-${po.id}`}</div>
        <div>供应商：{po.supplier_name}</div>
        <div>当前状态：{po.status}</div>
      </div>
    </section>
  );
};
