// src/features/admin/shipping-providers/scheme/preview/QuotePreviewResult.tsx

import React, { useMemo } from "react";
import { safeMoney, safeText } from "./utils";
import type { CalcOut, QuoteDestAdjustmentOut, QuoteSurchargeOut } from "./types";
import { renderBracketRange, resolvePricingModelCn, renderConditionCn, renderDetailCn } from "./quotePreviewResultHelpers";

function readSurcharges(result: CalcOut): QuoteSurchargeOut[] {
  const arr = result.breakdown?.surcharges;
  return Array.isArray(arr) ? arr : [];
}

function readDestAdjustments(result: CalcOut): QuoteDestAdjustmentOut[] {
  const arr = result.breakdown?.dest_adjustments;
  return Array.isArray(arr) ? arr : [];
}

export const QuotePreviewResult: React.FC<{ result: CalcOut | null }> = ({ result }) => {
  // ✅ hooks 必须无条件执行：先抽取 summary（允许为 null），再 useMemo
  const summary = result?.breakdown?.summary ?? null;

  const summaryView = useMemo(() => {
    const base = summary?.base_amount ?? null;
    const da = summary?.dest_adjustment_amount ?? null;

    // 新字段优先；旧字段兜底
    const legacy = summary?.legacy_surcharge_amount ?? summary?.surcharge_amount ?? null;

    const extra =
      summary?.extra_amount ?? (typeof da === "number" && typeof legacy === "number" ? da + legacy : null);

    const total = summary?.total_amount ?? null;

    return { base, da, legacy, extra, total };
  }, [summary]);

  if (!result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-800">算价结果</div>
        <div className="mt-3 text-sm font-mono text-slate-600">—</div>
      </div>
    );
  }

  const zoneName = safeText(result.zone?.name ?? result.zone?.id);
  const bracketRangeText = renderBracketRange(result.bracket?.min_kg, result.bracket?.max_kg);
  const pricingModelCn = resolvePricingModelCn(result.bracket);

  const destAdjustments = readDestAdjustments(result);
  const surcharges = readSurcharges(result);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-800">算价结果</div>

      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
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
            <div className="text-sm text-slate-600">命中 Zone</div>
            <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{zoneName}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">命中重量段</div>
            <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{bracketRangeText}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">命中计价模型</div>
            <div className="mt-1 text-base font-semibold text-slate-900 font-mono">{pricingModelCn}</div>
          </div>
        </div>

        {/* ✅ 新：目的地附加费（结构化事实） */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">目的地附加费命中明细</div>

          {destAdjustments.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                    <th className="px-3 py-2 w-[72px]">序号</th>
                    <th className="px-3 py-2 w-[120px]">ID</th>
                    <th className="px-3 py-2 w-[100px]">范围</th>
                    <th className="px-3 py-2">省份</th>
                    <th className="px-3 py-2">城市</th>
                    <th className="px-3 py-2 w-[140px]">金额（元）</th>
                  </tr>
                </thead>

                <tbody>
                  {destAdjustments.map((d, idx) => (
                    <tr key={String(d.id ?? idx)} className="border-b border-slate-100 align-top text-sm">
                      <td className="px-3 py-2 font-mono text-slate-700">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-900">{safeText(d.id)}</td>
                      <td className="px-3 py-2">{safeText(d.scope) === "city" ? "市" : "省"}</td>
                      <td className="px-3 py-2 text-slate-900">{safeText(d.province)}</td>
                      <td className="px-3 py-2 text-slate-900">{d.city ? safeText(d.city) : "—"}</td>
                      <td className="px-3 py-2 font-mono text-slate-900">{d.amount == null ? "—" : safeMoney(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-2 text-sm font-mono text-slate-600">—</div>
          )}
        </div>

        {/* 规则附加费（legacy surcharges） */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">规则附加费命中明细</div>

          {surcharges.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                    <th className="px-3 py-2 w-[72px]">序号</th>
                    <th className="px-3 py-2 w-[120px]">规则ID</th>
                    <th className="px-3 py-2">规则名称</th>
                    <th className="px-3 py-2 w-[140px]">金额（元）</th>
                    <th className="px-3 py-2">生效条件</th>
                    <th className="px-3 py-2">计费明细</th>
                  </tr>
                </thead>

                <tbody>
                  {surcharges.map((s, idx) => (
                    <tr key={s.id ?? idx} className="border-b border-slate-100 align-top text-sm">
                      <td className="px-3 py-2 font-mono text-slate-700">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-900">{safeText(s.id)}</td>
                      <td className="px-3 py-2 text-slate-900">{safeText(s.name)}</td>
                      <td className="px-3 py-2 font-mono text-slate-900">{s.amount == null ? "—" : safeMoney(s.amount)}</td>
                      <td className="px-3 py-2">{renderConditionCn(s.condition ?? null)}</td>
                      <td className="px-3 py-2">{renderDetailCn(s.detail ?? null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-2 text-sm font-mono text-slate-600">—</div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-800">最终价格拆解</div>

          {summary ? (
            <div className="mt-2 text-xs text-slate-700 font-mono">
              基础运费：{summaryView.base == null ? "—" : safeMoney(summaryView.base)} {" · "}
              目的地附加费：{summaryView.da == null ? "—" : safeMoney(summaryView.da)} {" · "}
              规则附加费：{summaryView.legacy == null ? "—" : safeMoney(summaryView.legacy)} {" · "}
              附加费合计：{summaryView.extra == null ? "—" : safeMoney(summaryView.extra)} {" · "}
              合计：{summaryView.total == null ? "—" : safeMoney(summaryView.total)}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-700 font-mono">—</div>
          )}

          <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-800">
            最终价格：
            <span className="ml-2 font-mono text-base font-semibold">
              {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewResult;
