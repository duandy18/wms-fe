// src/features/dev/shipping-pricing/components/LabExplainSummary.tsx

import React from "react";
import type { ExplainSummary } from "../labUtils";
import { safeJson } from "../labUtils";

export const LabExplainSummary: React.FC<{ s: ExplainSummary }> = ({ s }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">解释摘要（Explain）</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">quote_status</div>
          <div className="mt-1 font-mono text-slate-900">{s.quoteStatus || "—"}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">total_amount</div>
          <div className="mt-1 font-mono text-slate-900">
            {s.totalAmount == null ? "—" : `${s.totalAmount.toFixed(2)} ${s.currency}`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">pricing_mode</div>
          <div className="mt-1 font-mono text-slate-900">{s.bracketMode || "—"}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-700">命中 Zone</div>
          <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
            {safeJson(s.hitZone)}
          </pre>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-700">命中 Bracket</div>
          <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
            {safeJson(s.hitBracket)}
          </pre>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-700">reasons[]</div>
          <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
            {safeJson(s.reasons)}
          </pre>
        </div>

        <div className="rounded-xl border border-slate-200 p-3">
          <div className="text-xs font-semibold text-slate-700">breakdown / weight</div>
          <pre className="mt-2 max-h-[220px] overflow-auto rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
            {safeJson({ weight: s.weight, breakdown: s.breakdown })}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LabExplainSummary;
