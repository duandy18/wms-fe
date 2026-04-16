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
const kpiHintBase = "mt-1 text-[11px] leading-5 text-slate-500";

const PurchaseReportsKpiCards: React.FC<Props> = ({ summary }) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>采购单数</div>
        <div className={kpiValueBase}>{summary?.order_count ?? 0}</div>
        <div className={kpiHintBase}>当前筛选范围内命中的采购单</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>供应商数</div>
        <div className={kpiValueBase}>{summary?.supplier_count ?? 0}</div>
        <div className={kpiHintBase}>当前筛选范围内命中的供应商</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>商品数</div>
        <div className={kpiValueBase}>{summary?.item_count ?? 0}</div>
        <div className={kpiHintBase}>当前筛选范围内命中的商品</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>采购数量（辅助）</div>
        <div className={kpiValueBase}>{summary?.total_qty_cases ?? 0}</div>
        <div className={kpiHintBase}>仅作辅助展示，不作为跨商品硬口径</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>最小单位数（硬口径）</div>
        <div className={kpiValueBase}>{summary?.total_units ?? 0}</div>
        <div className={kpiHintBase}>跨商品比较请以此为准</div>
      </div>

      <div className={[kpiCardBase, "border-slate-200 bg-white"].join(" ")}>
        <div className={kpiTitleBase}>计划金额</div>
        <div className={kpiValueBase}>{fmtMoney(summary?.total_amount)}</div>
        <div className={kpiHintBase}>当前不是实际收货金额</div>
      </div>
    </section>
  );
};

export default PurchaseReportsKpiCards;
