// src/features/admin/shipping-providers/scheme/preview/QuotePreviewResult.tsx

import React, { useMemo } from "react";
import type { CalcOut } from "./types";
import QuoteResultHeaderCards from "./result/QuoteResultHeaderCards";
import QuoteMainFlowCard from "./result/QuoteMainFlowCard";
import DestAdjustmentsCard from "./result/DestAdjustmentsCard";
import OtherSurchargesCard from "./result/OtherSurchargesCard";
import QuoteFinalBreakdownCard from "./result/QuoteFinalBreakdownCard";
import { buildSummaryView, readDestAdjustments, readRuleAdjustments } from "./result/viewModel";

export const QuotePreviewResult: React.FC<{ result: CalcOut | null }> = ({ result }) => {
  const summaryView = useMemo(() => buildSummaryView(result), [result]);

  if (!result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-800">算价结果</div>
        <div className="mt-3 text-sm font-mono text-slate-600">—</div>
      </div>
    );
  }

  const destAdjustments = readDestAdjustments(result);
  const ruleAdjustments = readRuleAdjustments(result);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">算价结果</div>

      <div className="mt-3 space-y-3">
        <QuoteResultHeaderCards result={result} />

        <QuoteMainFlowCard result={result} baseAmount={summaryView.base} />

        <DestAdjustmentsCard rows={destAdjustments} />

        <OtherSurchargesCard rows={ruleAdjustments} />

        <QuoteFinalBreakdownCard summary={summaryView} />
      </div>
    </div>
  );
};

export default QuotePreviewResult;
