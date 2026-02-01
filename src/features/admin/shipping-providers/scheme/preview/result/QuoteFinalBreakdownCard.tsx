// src/features/admin/shipping-providers/scheme/preview/result/QuoteFinalBreakdownCard.tsx

import React from "react";
import { safeMoney } from "../utils";
import type { SummaryView } from "./viewModel";

export const QuoteFinalBreakdownCard: React.FC<{ summary: SummaryView }> = ({ summary }) => {
  const baseAmountText = summary.base == null ? "—" : `￥${safeMoney(summary.base)}`;
  const daAmountText = summary.da == null ? "—" : `￥${safeMoney(summary.da)}`;
  const legacyAmountText = summary.legacy == null ? "—" : `￥${safeMoney(summary.legacy)}`;
  const extraAmountText = summary.extra == null ? "—" : `￥${safeMoney(summary.extra)}`;
  const totalAmountText = summary.total == null ? "—" : `￥${safeMoney(summary.total)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">最终价格拆解</div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
        <div className="text-xs text-slate-600">算式：</div>
        <div className="mt-1 font-mono text-sm">
          {baseAmountText}（基础运费） <span className="text-slate-400">+</span> {daAmountText}（目的地附加费）{" "}
          <span className="text-slate-400">+</span> {legacyAmountText}（其他加价项）{" "}
          <span className="text-slate-400">=</span> <span className="font-semibold">{totalAmountText}</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">附加合计：{extraAmountText}</div>
      </div>
    </div>
  );
};

export default QuoteFinalBreakdownCard;
