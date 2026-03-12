// src/features/admin/shipping-providers/scheme/preview/result/QuoteResultHeaderCards.tsx

import React, { useMemo } from "react";
import type { CalcOut } from "../types";
import { safeMoney, safeText } from "../utils";
import { renderBracketRange, resolvePricingModelCn } from "../quotePreviewResultHelpers";
import { fmtKg } from "./viewModel";

export const QuoteResultHeaderCards: React.FC<{ result: CalcOut }> = ({ result }) => {
  const groupName = safeText(result.destination_group?.name ?? result.destination_group?.id);
  const matrixRangeText = renderBracketRange(result.pricing_matrix?.min_kg, result.pricing_matrix?.max_kg);
  const pricingModelCn = resolvePricingModelCn(result.pricing_matrix);

  const wrec = useMemo<Record<string, unknown>>(() => {
    const w = result.weight;
    return typeof w === "object" && w !== null && !Array.isArray(w) ? (w as Record<string, unknown>) : {};
  }, [result.weight]);

  const realW = wrec["real_weight_kg"] ?? null;
  const volW = wrec["vol_weight_kg"] ?? null;
  const billableRaw = wrec["billable_weight_kg_raw"] ?? null;
  const billable = wrec["billable_weight_kg"] ?? null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">状态</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{safeText(result.quote_status)}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">最终价格</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">
          {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">命中区域组</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{groupName}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">命中重量段</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{matrixRangeText}</div>
        <div className="mt-1 text-xs text-slate-500">按计费重命中矩阵单元格</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">命中计价模型</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{pricingModelCn}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">计费重（kg）</div>
        <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{fmtKg(billable)}</div>
        <div className="mt-1 text-xs text-slate-500">raw: {fmtKg(billableRaw)}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">实重/体积重（kg）</div>
        <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">
          实 {fmtKg(realW)} <span className="text-slate-400">·</span> 体 {fmtKg(volW)}
        </div>
        <div className="mt-1 text-xs text-slate-500">体积重由长×宽×高/8000 推导</div>
      </div>
    </div>
  );
};

export default QuoteResultHeaderCards;
