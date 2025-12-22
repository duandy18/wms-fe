// src/features/admin/shipping-providers/scheme/brackets/quoteModel.ts

import type { PricingSchemeZoneBracket } from "../../api";
import type { WeightSegment } from "./PricingRuleEditor";

// 口径：manual | flat | linear_total（票费 + 总重×元/kg）
//
// 立法（本轮不可破）：
// - 真相字段：pricing_mode + flat_amount/base_amount/rate_per_kg
// - 前端禁止“猜模型”
//   ❌ 不读 price_json.kind
//   ❌ 不用字段是否为 null 推断
// - price_json 仅用于解释/审计镜像，UI/保存不依赖它
export type CellMode = "manual" | "flat" | "linear_total";

export type RowDraft = {
  mode: CellMode;

  // flat
  flatAmount: string;

  // linear_total
  baseAmount: string; // 票费（每票固定）
  ratePerKg: string; // 元/kg

  // legacy field（保留但不暴露为主入口）
  baseKg: string;
};

export function parseNum(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmt2Str(v: unknown): string {
  if (v == null) return "0";
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  // 不强制 2 位小数：录入/回显优先“像人写的数”
  return String(n);
}

function fmtMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(2);
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
  // 这些字段在后端契约里是稳定的；即使 TS 类型没写全，也不要用 any
  const min = Number(getUnknownField(b, "min_kg"));
  const maxRaw = getUnknownField(b, "max_kg");
  const max = maxRaw == null ? null : Number(maxRaw);
  return segKey(min, max);
}

export function defaultDraft(): RowDraft {
  // ✅ 本轮裁决：所有可编辑数值字段默认值统一为 "0"
  return {
    mode: "linear_total",
    flatAmount: "0",
    baseKg: "1",
    baseAmount: "0",
    ratePerKg: "0",
  };
}

export function draftFromBracket(b: PricingSchemeZoneBracket): RowDraft {
  // ✅ 只认 pricing_mode，不读 price_json
  const mode = getLowerStringField(b, "pricing_mode");

  if (mode === "flat") {
    const amt = fmt2Str(getUnknownField(b, "flat_amount"));
    return {
      mode: "flat",
      flatAmount: amt,
      baseKg: "1",
      baseAmount: "0",
      ratePerKg: "0",
    };
  }

  if (mode === "linear_total") {
    const base = fmt2Str(getUnknownField(b, "base_amount"));
    const rate = fmt2Str(getUnknownField(b, "rate_per_kg"));
    return {
      mode: "linear_total",
      flatAmount: "0",
      baseKg: "1",
      baseAmount: base,
      ratePerKg: rate,
    };
  }

  return {
    mode: "manual",
    flatAmount: "0",
    baseKg: "1",
    baseAmount: "0",
    ratePerKg: "0",
  };
}

export function buildPayloadFromDraft(d: RowDraft): {
  pricing_mode: "flat" | "linear_total" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
} {
  // ✅ pricing_mode 是唯一真相：只按 mode 输出允许字段
  if (d.mode === "flat") {
    const amt = parseNum((d.flatAmount ?? "").trim());
    return {
      pricing_mode: "flat",
      flat_amount: amt == null ? 0 : amt,
    };
  }

  if (d.mode === "linear_total") {
    const baseAmt = parseNum((d.baseAmount ?? "").trim());
    const rate = parseNum((d.ratePerKg ?? "").trim());
    return {
      pricing_mode: "linear_total",
      base_amount: baseAmt == null ? 0 : baseAmt,
      rate_per_kg: rate == null ? 0 : rate,
    };
  }

  return { pricing_mode: "manual_quote" };
}

export function summarizeDraft(d: RowDraft): string {
  if (d.mode === "flat") return `￥${fmtMoney(d.flatAmount)}`;
  if (d.mode === "linear_total") {
    const base = d.baseAmount.trim() || "0";
    const rate = d.ratePerKg.trim() || "0";
    return `票费￥${fmtMoney(base)} + ￥${fmtMoney(rate)}/kg`;
  }
  return "人工/未设";
}

export function summarizeBracket(b: PricingSchemeZoneBracket): string {
  // ✅ 严格按 pricing_mode 展示，不读取 price_json.kind
  const mode = getLowerStringField(b, "pricing_mode");

  if (mode === "flat") {
    return `￥${fmtMoney(getUnknownField(b, "flat_amount"))}`;
  }

  if (mode === "linear_total") {
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
