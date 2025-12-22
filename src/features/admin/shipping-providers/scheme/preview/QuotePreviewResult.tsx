// src/features/admin/shipping-providers/scheme/preview/QuotePreviewResult.tsx

import React, { useMemo } from "react";
import { safeMoney, safeNum, safeText, pickBillableWeight } from "./utils";
import type { CalcOut } from "./types";

export const QuotePreviewResult: React.FC<{ result: CalcOut | null }> = ({ result }) => {
  const bw = useMemo(() => pickBillableWeight(result?.weight), [result]);

  const zoneName = safeText(result?.zone?.name ?? result?.zone?.id);
  const bracketId = safeText(result?.bracket?.id);

  const bracketMode = safeText(result?.bracket?.pricing_mode);
  const bracketFlat = result?.bracket?.flat_amount ?? null;
  const bracketBase = result?.bracket?.base_amount ?? null;
  const bracketRate = result?.bracket?.rate_per_kg ?? null;

  const summary = result?.breakdown?.summary;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">算价结果摘要</div>

      {!result ? (
        <div className="mt-2 text-sm text-slate-600">尚未算价。请填写条件后点击“开始算价”。</div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">状态</div>
              <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{safeText(result.quote_status)}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">总价</div>
              <div className="mt-1 text-base font-semibold text-slate-900 font-mono">
                {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
              </div>
              <div className="mt-1 text-sm text-slate-500 font-mono">{safeText(result.currency ?? "CNY")}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">命中 Zone</div>
              <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{zoneName}</div>
              {result.zone?.hit_member ? (
                <div className="mt-1 text-xs text-slate-600 font-mono">
                  hit={safeText(result.zone.hit_member.level)}:{safeText(result.zone.hit_member.value)}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">命中 Bracket</div>
              <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{bracketId}</div>
              <div className="mt-1 text-xs text-slate-600 font-mono">
                mode={bracketMode}
                {bracketFlat != null ? ` · flat=${safeMoney(bracketFlat)}` : ""}
                {bracketRate != null ? ` · rate=${safeMoney(bracketRate)}` : ""}
                {bracketBase != null ? ` · base=${safeMoney(bracketBase)}` : ""}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-800">计费重量</div>
            <div className="mt-2 text-sm text-slate-700">
              实重：<span className="font-mono">{safeNum(result.weight?.real_weight_kg, 3)}kg</span> {" · "}
              体积重：<span className="font-mono">{safeNum(result.weight?.vol_weight_kg, 3)}kg</span> {" · "}
              计费重：<span className="font-mono">{safeNum(bw, 3)}kg</span>
            </div>
          </div>

          {summary ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-800">对账摘要（summary）</div>
              <div className="mt-2 text-xs text-slate-700 font-mono">
                base={summary.base_amount == null ? "—" : safeMoney(summary.base_amount)} · surcharge=
                {summary.surcharge_amount == null ? "—" : safeMoney(summary.surcharge_amount)} · total=
                {summary.total_amount == null ? "—" : safeMoney(summary.total_amount)}
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-800">
                总计：
                <span className="ml-2 font-mono text-base font-semibold">
                  {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
                </span>
              </div>
            </div>
          ) : null}

          <div className="text-xs text-slate-500">
            提示：命中解释（reasons）与费用明细（breakdown/raw）已迁入 DevConsole → Shipping Pricing Lab。
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotePreviewResult;
