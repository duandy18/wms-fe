// src/features/tms/providers/scheme/preview/QuotePreviewResult.tsx

import React, { useMemo } from "react";
import type { CalcOut } from "./types";
import QuoteResultHeaderCards from "./result/QuoteResultHeaderCards";
import QuoteMainFlowCard from "./result/QuoteMainFlowCard";
import OtherSurchargesCard from "./result/OtherSurchargesCard";
import QuoteFinalBreakdownCard from "./result/QuoteFinalBreakdownCard";
import { buildSummaryView, readRuleAdjustments } from "./result/viewModel";
import { toReasonsList } from "./utils";

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

  const ruleAdjustments = readRuleAdjustments(result);
  const reasons = toReasonsList(result);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">算价结果</div>

      <div className="mt-3 space-y-3">
        <QuoteResultHeaderCards result={result} />

        <QuoteMainFlowCard result={result} baseAmount={summaryView.base} />

        <OtherSurchargesCard rows={ruleAdjustments} />

        <QuoteFinalBreakdownCard summary={summaryView} />

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">后端解释证据</div>
          <div className="mt-1 text-xs text-slate-500">以下内容直接来自 calc.reasons，可用于核查命中链路。</div>

          {reasons.length ? (
            <div className="mt-3 space-y-2">
              {reasons.map((x, idx) => (
                <div
                  key={`${idx}-${x}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800"
                >
                  {x}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm font-mono text-slate-600">—</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewResult;
