// src/features/admin/shipping-providers/scheme/brackets/quoteModel.ts

import type { PricingSchemeZoneBracket } from "../../api";
import type { WeightSegment } from "./PricingRuleEditor";

// 口径：manual | flat | linear_total | step_over
//
// 立法（本轮不可破）：
// - 真相字段：pricing_mode + flat_amount/base_amount/rate_per_kg/base_kg
// - 前端禁止“猜模型”
//   ❌ 不读 price_json.kind
//   ❌ 不用字段是否为 null 推断
// - price_json 仅用于解释/审计镜像，UI/保存不依赖它
export type CellMode = "manual" | "flat" | "linear_total" | "step_over";

export type RowDraft = {
  mode: CellMode;

  // flat
  flatAmount: string;

  // linear_total / step_over
  baseAmount: string; // 票费/首重费（元/票）
  ratePerKg: string; // 元/kg

  // step_over
  baseKg: string; // 首重 kg（例如 3.0）
};

export function parseNum(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmt2Str(v: unknown): string {
  if (v == null) return "0";
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
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

function readFirstField(obj: unknown, keys: string[]): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in rec) return rec[k];
  }
  return undefined;
}

function readNumberField(obj: unknown, keys: string[]): number | null {
  const v = readFirstField(obj, keys);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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
  // ✅ 强健：兼容后端字段名差异；无法解析时返回 “__INVALID__<id>”
  const idRaw = readFirstField(b, ["id"]);
  const id = Number(idRaw);
  const idTag = Number.isFinite(id) ? String(id) : "x";

  const min = readNumberField(b, ["min_kg", "minKg", "min", "min_weight_kg", "minWeightKg"]);
  if (min == null) return `__INVALID__${idTag}__MIN`;

  const maxRaw = readFirstField(b, ["max_kg", "maxKg", "max", "max_weight_kg", "maxWeightKg"]);
  let max: number | null = null;
  if (maxRaw == null || maxRaw === "") {
    max = null;
  } else {
    const n = Number(maxRaw);
    if (!Number.isFinite(n)) return `__INVALID__${idTag}__MAX`;
    max = n;
  }

  if (max != null && max <= min) return `__INVALID__${idTag}__RANGE`;

  return segKey(min, max);
}

/**
 * ✅ 零默认、零暗示：
 * - 默认草稿为 manual（需补录）
 * - 用户必须显式选择计价方式并填写所需字段，才能保存写入
 */
export function defaultDraft(): RowDraft {
  return {
    mode: "manual",
    flatAmount: "",
    baseKg: "",
    baseAmount: "",
    ratePerKg: "",
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
      baseKg: "",
      baseAmount: "",
      ratePerKg: "",
    };
  }

  if (mode === "linear_total") {
    const base = fmt2Str(getUnknownField(b, "base_amount"));
    const rate = fmt2Str(getUnknownField(b, "rate_per_kg"));
    return {
      mode: "linear_total",
      flatAmount: "",
      baseKg: "",
      baseAmount: base,
      ratePerKg: rate,
    };
  }

  if (mode === "step_over") {
    const baseKg = fmt2Str(getUnknownField(b, "base_kg"));
    const base = fmt2Str(getUnknownField(b, "base_amount"));
    const rate = fmt2Str(getUnknownField(b, "rate_per_kg"));
    return {
      mode: "step_over",
      flatAmount: "",
      baseKg: baseKg || "",
      baseAmount: base,
      ratePerKg: rate,
    };
  }

  return defaultDraft();
}

/**
 * ✅ 草稿校验（保存前必须通过）
 * - 不允许把空值“自动写成 0”
 * - 0 只有在用户显式输入 "0" 时才是合法事实
 */
export function validateDraft(d: RowDraft): string | null {
  const mode = d.mode;

  if (mode === "manual") return "请选择计价方式并填写必填字段";

  const requireNum = (label: string, raw: string, opts?: { gt0?: boolean }) => {
    const s = (raw ?? "").trim();
    if (!s) return `${label}未填写`;
    const n = parseNum(s);
    if (n == null) return `${label}不是合法数字`;
    if (n < 0) return `${label}不能为负数`;
    if (opts?.gt0 && !(n > 0)) return `${label}必须大于 0`;
    return null;
  };

  if (mode === "flat") {
    return requireNum("固定价", d.flatAmount);
  }

  if (mode === "linear_total") {
    return requireNum("票费/首重费", d.baseAmount) ?? requireNum("续重单价", d.ratePerKg);
  }

  if (mode === "step_over") {
    return (
      requireNum("首重重量", d.baseKg, { gt0: true }) ??
      requireNum("首重费", d.baseAmount) ??
      requireNum("续重单价", d.ratePerKg)
    );
  }

  return "未知计价方式";
}

export function buildPayloadFromDraft(d: RowDraft): {
  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote";
  flat_amount?: number;
  base_amount?: number;
  rate_per_kg?: number;
  base_kg?: number;
} {
  // ✅ 禁止“空值 -> 0”写入：必须先通过 validateDraft
  const err = validateDraft(d);
  if (err) {
    // 这里抛错是为了防止任何调用方绕过 UI 校验写脏数据
    throw new Error(err);
  }

  if (d.mode === "flat") {
    return {
      pricing_mode: "flat",
      flat_amount: Number((d.flatAmount ?? "").trim()),
    };
  }

  if (d.mode === "linear_total") {
    return {
      pricing_mode: "linear_total",
      base_amount: Number((d.baseAmount ?? "").trim()),
      rate_per_kg: Number((d.ratePerKg ?? "").trim()),
    };
  }

  if (d.mode === "step_over") {
    return {
      pricing_mode: "step_over",
      base_kg: Number((d.baseKg ?? "").trim()),
      base_amount: Number((d.baseAmount ?? "").trim()),
      rate_per_kg: Number((d.ratePerKg ?? "").trim()),
    };
  }

  // 理论上走不到
  return { pricing_mode: "manual_quote" };
}

export function summarizeDraft(d: RowDraft): string {
  const err = validateDraft(d);
  if (err) return "未设/需补录";

  if (d.mode === "flat") return `￥${fmtMoney(d.flatAmount)}`;
  if (d.mode === "linear_total") {
    const base = d.baseAmount.trim();
    const rate = d.ratePerKg.trim();
    return `票费￥${fmtMoney(base)} + ￥${fmtMoney(rate)}/kg`;
  }
  if (d.mode === "step_over") {
    const baseKg = d.baseKg.trim();
    const base = d.baseAmount.trim();
    const rate = d.ratePerKg.trim();
    return `首重${baseKg}kg￥${fmtMoney(base)} + 续重￥${fmtMoney(rate)}/kg`;
  }
  return "未设/需补录";
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

  if (mode === "step_over") {
    const baseKg = getUnknownField(b, "base_kg");
    const base = getUnknownField(b, "base_amount");
    const rate = getUnknownField(b, "rate_per_kg");
    return `首重${fmt2Str(baseKg)}kg￥${fmtMoney(base)} + 续重￥${fmtMoney(rate)}/kg`;
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
