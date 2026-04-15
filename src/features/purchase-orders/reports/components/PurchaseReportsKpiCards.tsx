// 拆分说明：从 PurchaseReportsPage.tsx 抽出 KPI 卡片区，页面层只负责装配。路径：src/features/purchase-orders/reports/components/PurchaseReportsKpiCards.tsx

import React from "react";
import type { SummaryPurchaseReportItem } from "../types";
import { fmtMoney } from "../utils";

type Props = {
  summary: SummaryPurchaseReportItem | null;
};

const kpiCardBase = "rounded-xl border px-4 py-3";
const kpiTitleBase = "text-xs text-slate-500";
const kpiValueBase = "mt-1 text-lg font-semibold text-slate-900";

const PurchaseReportsKpiCards: React.FC<Props> = ({ summary }) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>采购单数</div>
        <div className={kpiValueBase}>{summary?.order_count ?? 0}</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>供应商数</div>
        <div className={kpiValueBase}>{summary?.supplier_count ?? 0}</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>商品数</div>
        <div className={kpiValueBase}>{summary?.item_count ?? 0}</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>件数合计</div>
        <div className={kpiValueBase}>{summary?.total_qty_cases ?? 0}</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>最小单位数合计</div>
        <div className={kpiValueBase}>{summary?.total_units ?? 0}</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>金额合计</div>
        <div className={kpiValueBase}>{fmtMoney(summary?.total_amount)}</div>
      </div>
    </section>
  );
};

export default PurchaseReportsKpiCards;
