// src/features/admin/shipping-providers/scheme/preview/QuotePreviewResult.tsx

import React, { useMemo } from "react";
import { safeMoney, safeNum, safeText, pickBillableWeight } from "./utils";
import type { CalcOut } from "./types";
import { UI } from "../ui";

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
    <div className={UI.previewResultCard}>
      <div className={UI.sectionTitle}>算价结果摘要</div>

      {!result ? (
        <div className={`mt-2 ${UI.helpText}`}>尚未算价。请填写条件后点击“开始算价”。</div>
      ) : (
        <div className={UI.previewResultBody}>
          <div className={UI.previewResultGrid4}>
            <div className={UI.previewResultStatCard}>
              <div className={UI.previewResultStatLabel}>状态</div>
              <div className={UI.previewResultStatValue}>{safeText(result.quote_status)}</div>
            </div>

            <div className={UI.previewResultStatCard}>
              <div className={UI.previewResultStatLabel}>总价</div>
              <div className={UI.previewResultStatValue}>
                {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
              </div>
              <div className={UI.previewResultStatSub}>{safeText(result.currency ?? "CNY")}</div>
            </div>

            <div className={UI.previewResultStatCard}>
              <div className={UI.previewResultStatLabel}>命中 Zone</div>
              <div className={UI.previewResultStatValue}>{zoneName}</div>
              {result.zone?.hit_member ? (
                <div className={UI.previewResultTinyMono}>
                  hit={safeText(result.zone.hit_member.level)}:{safeText(result.zone.hit_member.value)}
                </div>
              ) : null}
            </div>

            <div className={UI.previewResultStatCard}>
              <div className={UI.previewResultStatLabel}>命中 Bracket</div>
              <div className={UI.previewResultStatValue}>{bracketId}</div>
              <div className={UI.previewResultTinyMono}>
                mode={bracketMode}
                {bracketFlat != null ? ` · flat=${safeMoney(bracketFlat)}` : ""}
                {bracketRate != null ? ` · rate=${safeMoney(bracketRate)}` : ""}
                {bracketBase != null ? ` · base=${safeMoney(bracketBase)}` : ""}
              </div>
            </div>
          </div>

          <div className={UI.previewResultStatCard}>
            <div className={UI.sectionTitle}>计费重量</div>
            <div className={UI.previewResultWeightLine}>
              实重：<span className={UI.previewResultMono}>{safeNum(result.weight?.real_weight_kg, 3)}kg</span> {" · "}
              体积重：<span className={UI.previewResultMono}>{safeNum(result.weight?.vol_weight_kg, 3)}kg</span> {" · "}
              计费重：<span className={UI.previewResultMono}>{safeNum(bw, 3)}kg</span>
            </div>
          </div>

          {summary ? (
            <div className={UI.previewResultSummaryCard}>
              <div className={UI.sectionTitle}>对账摘要（summary）</div>
              <div className={UI.previewResultSummaryMono}>
                base={summary.base_amount == null ? "—" : safeMoney(summary.base_amount)} · surcharge=
                {summary.surcharge_amount == null ? "—" : safeMoney(summary.surcharge_amount)} · total=
                {summary.total_amount == null ? "—" : safeMoney(summary.total_amount)}
              </div>

              <div className={UI.previewResultSummaryTotalRow}>
                总计：
                <span className={UI.previewResultSummaryTotalValue}>
                  {result.total_amount == null ? "—" : `￥${safeMoney(result.total_amount)}`}
                </span>
              </div>
            </div>
          ) : null}

          <div className={UI.previewResultFootHint}>
            提示：命中解释（reasons）与费用明细（breakdown/raw）已迁入 DevConsole → Shipping Pricing Lab。
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotePreviewResult;
