// src/features/inventory/channel-inventory/ChannelInventorySummaryCard.tsx
import React from "react";

type Props = {
  hasData: boolean;
  totals: {
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;
  };
  warehouseCount: number;
};

export const ChannelInventorySummaryCard: React.FC<Props> = ({
  hasData,
  totals,
  warehouseCount,
}) => {
  if (!hasData) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex flex-wrap gap-4 text-xs">
        <div>
          <div className="text-slate-500">总 on_hand</div>
          <div className="text-base font-semibold">{totals.totalOnHand}</div>
        </div>
        <div>
          <div className="text-slate-500">总 reserved_open</div>
          <div className="text-base font-semibold">
            {totals.totalReserved}
          </div>
        </div>
        <div>
          <div className="text-slate-500">总 available</div>
          <div className="text-base font-semibold">
            {totals.totalAvailable}
          </div>
        </div>
        <div>
          <div className="text-slate-500">参与仓数量</div>
          <div className="text-base font-semibold">{warehouseCount}</div>
        </div>
      </div>
    </section>
  );
};
