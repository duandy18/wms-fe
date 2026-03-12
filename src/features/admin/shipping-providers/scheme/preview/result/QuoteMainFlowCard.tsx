// src/features/admin/shipping-providers/scheme/preview/result/QuoteMainFlowCard.tsx

import React, { useMemo } from "react";
import type { CalcOut } from "../types";
import { safeMoney, safeText } from "../utils";
import { renderBracketRange, resolvePricingModelCn } from "../quotePreviewResultHelpers";
import { baseKindLabelCn, fmtKg, readBaseBreakdown, readRoundingText } from "./viewModel";

export const QuoteMainFlowCard: React.FC<{ result: CalcOut; baseAmount: number | null }> = ({ result, baseAmount }) => {
  const groupName = safeText(result.destination_group?.name ?? result.destination_group?.id);
  const hitMember = result.destination_group?.hit_member ?? null;
  const hitMemberText = hitMember
    ? `${safeText(hitMember.level)} · ${safeText(hitMember.value)}`
    : "—";

  const matrixRangeText = renderBracketRange(result.pricing_matrix?.min_kg, result.pricing_matrix?.max_kg);
  const pricingModelCn = resolvePricingModelCn(result.pricing_matrix);

  const baseBd = readBaseBreakdown(result);

  const wrec = useMemo<Record<string, unknown>>(() => {
    const w = result.weight;
    return typeof w === "object" && w !== null && !Array.isArray(w) ? (w as Record<string, unknown>) : {};
  }, [result.weight]);

  const realW = wrec["real_weight_kg"] ?? null;
  const volW = wrec["vol_weight_kg"] ?? null;
  const billableRaw = wrec["billable_weight_kg_raw"] ?? null;
  const billable = wrec["billable_weight_kg"] ?? null;

  const roundingText = readRoundingText(result.weight);
  const baseAmountText = baseAmount == null ? "—" : `￥${safeMoney(baseAmount)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-800">运费主干计算</div>
      <div className="mt-1 text-xs text-slate-500">
        说明：运费由<strong>基础运费</strong>与<strong>附加费</strong>共同构成；本卡展示基础运费的完整计算过程（以<strong>后端输出</strong>为唯一真相）。
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-700">① 计费重的确定</div>

        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">实重（kg）</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{fmtKg(realW)}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">体积重（kg）</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{fmtKg(volW)}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">取整规则</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{roundingText}</div>
            <div className="mt-1 text-xs text-slate-500">计费重取整发生在后端</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">计费重（kg）</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {fmtKg(billable)} <span className="text-slate-400">·</span>{" "}
              <span className="text-xs text-slate-500">raw {fmtKg(billableRaw)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-700">② 命中计价规则</div>

        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">命中区域组</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{groupName}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">命中成员</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{hitMemberText}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">命中重量段</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{matrixRangeText}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">计价模型</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">{pricingModelCn}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-semibold text-slate-700">③ 基础运费计算</div>

        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">模型（后端）</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 font-mono">
              {baseBd ? baseKindLabelCn(baseBd.kind) : "—"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">票费（base_amount）</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {baseBd?.base_amount == null ? "—" : `￥${safeMoney(baseBd.base_amount)}`}
            </div>
            <div className="mt-1 text-xs text-slate-500">线性/步进模型可使用</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">首重kg / 基础kg</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {baseBd?.base_kg == null ? "—" : fmtKg(baseBd.base_kg)}
            </div>
            <div className="mt-1 text-xs text-slate-500">若模型不使用则为空</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">续重每公斤</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">
              {baseBd?.rate_per_kg == null ? "—" : `￥${safeMoney(baseBd.rate_per_kg)}/kg`}
            </div>
            <div className="mt-1 text-xs text-slate-500">若模型不使用则为空</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-600">基础运费（元）</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{baseAmountText}</div>
            <div className="mt-1 text-xs text-slate-500">后端 breakdown.summary.base_amount</div>
          </div>
        </div>

        {baseBd?.message ? <div className="mt-2 text-xs text-slate-600">说明：{baseBd.message}</div> : null}
      </div>
    </div>
  );
};

export default QuoteMainFlowCard;
