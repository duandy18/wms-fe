// src/features/tms/reports/components/TransportReportsOverview.tsx

import React from "react";

interface TransportReportsOverviewProps {
  totalShipCnt: number;
  totalCostText: string;
  error: string;
}

const TransportReportsOverview: React.FC<TransportReportsOverviewProps> = ({
  totalShipCnt,
  totalCostText,
  error,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs text-slate-500">发货单量</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {totalShipCnt}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">总预估费用</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {totalCostText}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </section>
  );
};

export default TransportReportsOverview;
