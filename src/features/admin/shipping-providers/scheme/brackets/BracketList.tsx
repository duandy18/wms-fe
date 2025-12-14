// src/features/admin/shipping-providers/scheme/brackets/BracketList.tsx

import React, { useMemo } from "react";
import type { PricingSchemeZoneBracket } from "../../api";
import { BracketRow } from "./BracketRow";

function fmtMoney(n: unknown): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(2);
}

function fmtKg(n: unknown, digits = 3): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "-";
  return v.toFixed(digits);
}

function describePricing(b: PricingSchemeZoneBracket): string {
  const pj = (b.price_json ?? {}) as Record<string, unknown>;
  const kind = String(pj["kind"] ?? b.pricing_kind ?? "").toLowerCase();

  if (kind === "flat") {
    return `固定价 ￥${fmtMoney(pj["amount"])}`;
  }

  if (kind === "per_kg") {
    const rate = pj["rate_per_kg"];
    const baseAmt = pj["base_amount"];
    const baseText =
      baseAmt != null && baseAmt !== "" && Number.isFinite(Number(baseAmt)) && Number(baseAmt) > 0
        ? `起步 ￥${fmtMoney(baseAmt)} + `
        : "";
    return `${baseText}￥${fmtMoney(rate)}/kg（按计费重）`;
  }

  if (kind === "per_kg_with_base") {
    // 兼容旧结构：base_fee:{label,amount}
    const baseFee = (pj["base_fee"] ?? {}) as Record<string, unknown>;
    const baseAmt = baseFee["amount"];
    const label = String(baseFee["label"] ?? "首费");
    const rate = pj["rate_per_kg"];
    return `${label} ￥${fmtMoney(baseAmt)} + ￥${fmtMoney(rate)}/kg`;
  }

  if (kind === "per_kg_over") {
    // 申通样板：首重封顶 + 续重
    const start = pj["start_kg"];
    const baseAmt = pj["base_amount"];
    const rate = pj["rate_per_kg"];
    return `首 ${fmtKg(start, 3)}kg 封顶 ￥${fmtMoney(baseAmt)}，超出部分 ￥${fmtMoney(rate)}/kg`;
  }

  if (kind === "manual_quote") {
    return "人工报价（该区间不会自动出价）";
  }

  // 未知：兜底
  return `计价：${kind || "unknown"}`;
}

export const BracketList: React.FC<{
  list: PricingSchemeZoneBracket[];
  disabled?: boolean;
  onToggle: (b: PricingSchemeZoneBracket) => Promise<void>;
  onDelete: (b: PricingSchemeZoneBracket) => Promise<void>;
}> = ({ list, disabled, onToggle, onDelete }) => {
  const sorted = useMemo(() => {
    // 让区间按 min_kg 从小到大显示，更符合人类读表习惯
    return [...list].sort((a, b) => Number(a.min_kg) - Number(b.min_kg) || a.id - b.id);
  }, [list]);

  if (!sorted.length) {
    return <div className="text-sm text-slate-600">暂无 Bracket。没有区间将导致算价失败。</div>;
  }

  return (
    <div className="space-y-2">
      {sorted.map((b) => (
        <div key={b.id} className="space-y-1">
          {/* 人话摘要：让维护人员一眼读懂 */}
          <div className="px-1 text-sm text-slate-600">
            <span className="font-mono">{describePricing(b)}</span>
          </div>

          <BracketRow b={b} disabled={disabled} onToggle={onToggle} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};
