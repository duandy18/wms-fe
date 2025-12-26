// src/features/admin/shipping-providers/scheme/brackets/quoteModel.ts

import type { PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";

// 立法（方案级口径）：
// - 方案级 default_pricing_mode 决定“主录价口径”
// - bracket 仍允许 manual_quote 作为兜底（极少数格子）
// - UI 不读 price_json.kind，不猜模型
export type CellMode = SchemeDefaultPricingMode | "manual_quote";

export type RowDraft = {
  mode: CellMode;
  flatAmount: string;
  baseAmount: string;
  ratePerKg: string;
  baseKg: string; // step_over：首重kg
};

export function parseNum(v: string): number | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function fmtMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function fmt2Str(v: unknown): string {
  if (v == null) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

function getLowerStringField(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;
  const v = rec[key];
  if (typeof v !== "string") return "";
  return v.toLowerCase();
}

function getUnknownField(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  return rec[key];
}

export function segLabel(s: WeightSegment): string {
  const min = s.min.trim();
  const max = s.max.trim();
  if (!min) return "未定义";
  if (!max) return `${min}kg+`;
  return `${min}–${max}kg`;
}

export function segKey(min: number, max: number | null): string {
  return `${min}__${max == null ? "INF" : String(max)}`;
}

export function keyFromSegment(s: WeightSegment): string | null {
  const min = parseNum(s.min.trim());
  if (min == null) return null;
  const max = s.max.trim() ? parseNum(s.max.trim()) : null;
  if (max != null && max <= min) return null;
  return segKey(min, max);
}

export function keyFromBracket(b: PricingSchemeZoneBracket): string {
  const min = Number(getUnknownField(b, "min_kg"));
  const maxRaw = getUnknownField(b, "max_kg");
  const max = maxRaw == null ? null : Number(maxRaw);
  return segKey(min, max);
}

export function defaultDraft(mode: SchemeDefaultPricingMode): RowDraft {
  return {
    mode,
    flatAmount: "",
    baseAmount: "",
    ratePerKg: "",
    baseKg: "",
  };
}

export function draftFromBracket(b: PricingSchemeZoneBracket, schemeMode: SchemeDefaultPricingMode): RowDraft {
  const m = getLowerStringField(b, "pricing_mode");

  if (m === "manual_quote") {
    return {
      mode: "manual_quote",
      flatAmount: "",
      baseAmount: "",
      ratePerKg: "",
      baseKg: "",
    };
  }

  if (m === "flat") {
    return {
      mode: "flat",
      flatAmount: fmt2Str(getUnknownField(b, "flat_amount")),
      baseAmount: "",
      ratePerKg: "",
      baseKg: "",
    };
  }

  if (m === "step_over") {
    return {
      mode: "step_over",
      flatAmount: "",
      baseKg: fmt2Str(getUnknownField(b, "base_kg")),
      baseAmount: fmt2Str(getUnknownField(b, "base_amount")),
      ratePerKg: fmt2Str(getUnknownField(b, "rate_per_kg")),
    };
  }

  if (m === "linear_total") {
    return {
      mode: "linear_total",
      flatAmount: "",
      baseAmount: fmt2Str(getUnknownField(b, "base_amount")),
      ratePerKg: fmt2Str(getUnknownField(b, "rate_per_kg")),
      baseKg: "",
    };
  }

  // 不认识的旧值：回到方案口径
  return defaultDraft(schemeMode);
}

function effectiveMode(d: RowDraft, schemeMode: SchemeDefaultPricingMode): SchemeDefaultPricingMode | "manual_quote" {
  const m = d.mode;
  if (m === "manual_quote") return "manual_quote";
  if (m === "flat" || m === "linear_total" || m === "step_over") return m;
  return schemeMode;
}

export function buildPayloadFromDraft(
  d: RowDraft,
  schemeMode: SchemeDefaultPricingMode,
): {
  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
} {
  const m = effectiveMode(d, schemeMode);
  if (m === "manual_quote") return { pricing_mode: "manual_quote" };

  if (m === "flat") {
    const amt = parseNum(d.flatAmount);
    return { pricing_mode: "flat", flat_amount: amt == null ? 0 : amt };
  }

  if (m === "step_over") {
    const baseKg = parseNum(d.baseKg);
    const baseAmt = parseNum(d.baseAmount);
    const rate = parseNum(d.ratePerKg);
    return {
      pricing_mode: "step_over",
      base_kg: baseKg == null ? 0 : baseKg,
      base_amount: baseAmt == null ? 0 : baseAmt,
      rate_per_kg: rate == null ? 0 : rate,
    };
  }

  // linear_total
  const baseAmt = parseNum(d.baseAmount);
  const rate = parseNum(d.ratePerKg);
  return {
    pricing_mode: "linear_total",
    base_amount: baseAmt == null ? 0 : baseAmt,
    rate_per_kg: rate == null ? 0 : rate,
  };
}

export function summarizeDraft(d: RowDraft, schemeMode: SchemeDefaultPricingMode): string {
  const m = effectiveMode(d, schemeMode);
  if (m === "manual_quote") return "人工/未设";

  if (m === "flat") return `￥${fmtMoney(d.flatAmount)}`;

  if (m === "step_over") {
    const bk = (d.baseKg ?? "").trim() || "—";
    const base = (d.baseAmount ?? "").trim() || "0";
    const rate = (d.ratePerKg ?? "").trim() || "0";
    return `首重${bk}kg ￥${fmtMoney(base)} + 续重￥${fmtMoney(rate)}/kg`;
  }

  const base = (d.baseAmount ?? "").trim() || "0";
  const rate = (d.ratePerKg ?? "").trim() || "0";
  return `票费￥${fmtMoney(base)} + ￥${fmtMoney(rate)}/kg`;
}

export function summarizeBracket(b: PricingSchemeZoneBracket): string {
  const m = getLowerStringField(b, "pricing_mode");

  if (m === "flat") return `￥${fmtMoney(getUnknownField(b, "flat_amount"))}`;

  if (m === "step_over") {
    const bk = fmt2Str(getUnknownField(b, "base_kg")) || "—";
    const base = getUnknownField(b, "base_amount");
    const rate = getUnknownField(b, "rate_per_kg");
    return `首重${bk}kg ￥${fmtMoney(base)} + 续重￥${fmtMoney(rate)}/kg`;
  }

  if (m === "linear_total") {
    const base = getUnknownField(b, "base_amount");
    const rate = getUnknownField(b, "rate_per_kg");
    return `票费￥${fmtMoney(base)} + ￥${fmtMoney(rate)}/kg`;
  }

  return "人工/未设";
}

export function isZoneActive(z: unknown): boolean {
  if (!z || typeof z !== "object") return true;
  const anyZ = z as Record<string, unknown>;
  if (typeof anyZ.active === "boolean") return anyZ.active;
  if (typeof anyZ.enabled === "boolean") return anyZ.enabled;
  return true;
}
