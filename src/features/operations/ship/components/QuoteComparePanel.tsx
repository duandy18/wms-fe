// src/features/operations/ship/components/QuoteComparePanel.tsx

import React from "react";
import { UI } from "../ui";
import { type ShipQuote } from "../api";

function safeMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(2);
}

type Props = {
  quotes: ShipQuote[];
  selectedSchemeId: number | null;
  recommendedSchemeId: number | null;
  onSelect: (schemeId: number) => void;
};

export const QuoteComparePanel: React.FC<Props> = ({
  quotes,
  selectedSchemeId,
  recommendedSchemeId,
  onSelect,
}) => {
  if (quotes.length === 0) {
    return <p className={UI.helper}>暂无有效报价。请先计算运费。</p>;
  }

  return (
    <div className="space-y-3">
      {quotes.map((q) => {
        const selected = selectedSchemeId === q.scheme_id;
        const recommended = recommendedSchemeId === q.scheme_id;

        const baseAmount =
          typeof q.breakdown?.base?.amount === "number"
            ? q.breakdown.base.amount
            : null;

        const surcharges = q.breakdown?.surcharges ?? [];

        return (
          <button
            key={q.scheme_id}
            type="button"
            onClick={() => onSelect(q.scheme_id)}
            className={`w-full rounded-2xl border p-4 text-left ${
              selected
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {q.carrier_name}
                  <span className="ml-2 text-sm font-mono text-slate-500">
                    {q.carrier_code ?? "-"}
                  </span>
                  {recommended ? (
                    <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-[2px] text-xs font-semibold text-emerald-700">
                      推荐
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  方案：<span className="font-mono">{q.scheme_name}</span>
                </div>
              </div>

              <div className="font-mono text-lg font-semibold text-slate-900">
                ￥{safeMoney(q.total_amount)}
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <div>
                Base：
                <span className="ml-2 font-mono">
                  ￥{baseAmount !== null ? safeMoney(baseAmount) : "-"}
                </span>
              </div>

              <div>
                Surcharges：
                <span className="ml-2">
                  {surcharges.length > 0 ? `${surcharges.length} 项` : "无"}
                </span>
              </div>

              <div className="pt-1 text-base font-semibold">
                Total：
                <span className="ml-2 font-mono">￥{safeMoney(q.total_amount)}</span>
              </div>
            </div>

            {selected && q.reasons?.length ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                <div className="mb-1 font-semibold text-slate-700">reasons</div>
                <ul className="list-disc space-y-1 pl-5">
                  {q.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};
