// src/features/orders/components/inline-detail/OrderInlineDetailHeader.tsx
import React from "react";
import type { OrderSummary } from "../../api";

export const OrderInlineDetailHeader: React.FC<{
  selectedSummary: OrderSummary;
  onClose: () => void;
}> = ({ selectedSummary, onClose }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">订单详情（当前选中）</h2>
        <div className="text-xs text-slate-500">
          {selectedSummary.platform}/{selectedSummary.shop_id} ·{" "}
          <span className="font-mono text-[11px]">{selectedSummary.ext_order_no}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-300 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-100"
        >
          关闭详情
        </button>
      </div>
    </div>
  );
};
