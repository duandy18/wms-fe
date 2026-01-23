// src/features/orders/components/inline-detail/ManualAssignBanner.tsx
import React from "react";

export const ManualAssignBanner: React.FC<{
  show: boolean;
  onOpen: () => void;
}> = ({ show, onOpen }) => {
  if (!show) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-800">
      <div className="font-semibold">尚未指定执行仓，当前订单无法履约</div>
      <div className="mt-1 text-[11px] text-red-700">
        该订单已命中服务归属仓，但执行出库仓为空。请先指定执行仓后再进行预占 / 拣货 / 发货。
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
        >
          指定执行仓
        </button>
      </div>
    </div>
  );
};
