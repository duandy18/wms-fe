// src/features/admin/shipping-providers/scheme/preview/result/viewModel.ts

import { safeText } from "../utils";
import type { CalcOut, QuoteSurchargeOut } from "../types";

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function fmtKg(n: unknown): string {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2);
}

export type SummaryView = {
  base: number | null;
  surcharge: number | null;
  extra: number | null;
  total: number | null;
};

export function buildSummaryView(result: CalcOut | null): SummaryView {
  const summary = result?.breakdown?.summary ?? null;
  const base = summary?.base_amount ?? null;
  const surcharge = summary?.surcharge_amount ?? null;
  const extra = summary?.extra_amount ?? surcharge ?? null;
  const total = summary?.total_amount ?? result?.total_amount ?? null;

  return { base, surcharge, extra, total };
}

export function readRuleAdjustments(result: CalcOut): QuoteSurchargeOut[] {
  const arr = result.breakdown?.surcharges;
  return Array.isArray(arr) ? arr : [];
}

export type BaseBreakdownView =
  | {
      kind: string;
      amount: number | null;
      billable_weight_kg: number | null;
      base_amount: number | null;
      rate_per_kg: number | null;
      base_kg: number | null;
      message: string | null;
      raw: Record<string, unknown>;
    }
  | null;

export function readBaseBreakdown(result: CalcOut): BaseBreakdownView {
  const base = result.breakdown?.base;
  if (!base) return null;
  if (!isRecord(base)) {
    return {
      kind: "unknown",
      amount: null,
      billable_weight_kg: null,
      base_amount: null,
      rate_per_kg: null,
      base_kg: null,
      message: null,
      raw: {},
    };
  }

  const kind = String(base.kind ?? "unknown");
  const amount = base.amount == null ? null : Number(base.amount);
  const billable = base.billable_weight_kg == null ? null : Number(base.billable_weight_kg);
  const baseAmount = base.base_amount == null ? null : Number(base.base_amount);
  const rate = base.rate_per_kg == null ? null : Number(base.rate_per_kg);
  const baseKg = base.base_kg == null ? null : Number(base.base_kg);
  const message = typeof base.message === "string" ? base.message : null;

  return {
    kind,
    amount: Number.isFinite(amount) ? amount : null,
    billable_weight_kg: Number.isFinite(billable) ? billable : null,
    base_amount: Number.isFinite(baseAmount) ? baseAmount : null,
    rate_per_kg: Number.isFinite(rate) ? rate : null,
    base_kg: Number.isFinite(baseKg) ? baseKg : null,
    message,
    raw: base,
  };
}

export function baseKindLabelCn(kind: string): string {
  const k = String(kind ?? "").toLowerCase();
  if (k === "flat") return "固定价格";
  if (k === "linear_total") return "首重+续重每公斤";
  if (k === "step_over") return "面单费+总重每公斤";
  if (k === "manual_quote") return "人工报价";
  return kind || "unknown";
}

export function pricingModeLabelCn(kind: string): string {
  return baseKindLabelCn(kind);
}

export function readRoundingText(weight: unknown): string {
  const w = isRecord(weight) ? weight : {};
  const r = w["rounding"];
  if (!isRecord(r)) return "—";

  const mode = safeText(r["mode"]).trim().toLowerCase();
  const step = r["step_kg"];

  const stepN = typeof step === "number" ? step : Number(step);
  const stepText = Number.isFinite(stepN) && stepN > 0 ? `${stepN} kg` : "—";

  if (!mode) return stepText === "—" ? "—" : `步长 ${stepText}`;
  if (mode === "ceil") return `向上取整（步长 ${stepText}）`;
  return `${safeText(mode)}（步长 ${stepText}）`;
}
