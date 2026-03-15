// src/features/tms/providers/scheme/preview/quotePreviewResultHelpers.tsx

import React from "react";
import type { CalcOut } from "./types";
import { safeText } from "./utils";

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).map((s) => s.trim()).filter(Boolean);
}

export function joinOrDash(arr: string[]): string {
  return arr.length ? arr.join("、") : "—";
}

export function numOrDash(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? String(n) : "—";
}

/** 重量段区间展示：min–max kg / min–∞ kg */
export function renderBracketRange(minKg: unknown, maxKg: unknown): string {
  const min = Number(minKg);
  const hasMin = Number.isFinite(min);

  if (maxKg === null || maxKg === undefined) {
    return hasMin ? `${min}–∞ kg` : "—";
  }

  const max = Number(maxKg);
  if (!Number.isFinite(max)) return "—";

  if (hasMin) return `${min}–${max} kg`;
  return `≤${max} kg`;
}

/**
 * 计价模型（中文）
 * 直接按当前后端 pricing_matrix.pricing_mode 解释。
 */
export function resolvePricingModelCn(matrix: CalcOut["pricing_matrix"]): string {
  const raw = safeText(matrix?.pricing_mode).trim().toLowerCase();

  if (raw === "flat") return "固定价格";
  if (raw === "linear_total") return "首重+续重每公斤";
  if (raw === "step_over") return "面单费+总重每公斤";
  if (raw === "manual_quote") return "人工报价";

  return raw ? safeText(raw) : "—";
}

export function renderDetailCn(detail: unknown): React.ReactNode {
  const d = isRecord(detail) ? detail : {};
  const kind = String(d["kind"] ?? "").trim().toLowerCase();

  if (!kind) return <span className="text-slate-600">—</span>;

  if (kind === "fixed") {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500">方式</span>
          <span className="text-slate-900">固定金额</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">金额</span>
          <span className="font-mono text-slate-900">{numOrDash(d["amount"])}</span>
        </div>
      </div>
    );
  }

  if (kind === "flat") {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500">方式</span>
          <span className="text-slate-900">固定金额</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">金额</span>
          <span className="font-mono text-slate-900">{numOrDash(d["amount"])}</span>
        </div>
      </div>
    );
  }

  if (kind === "per_kg") {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500">方式</span>
          <span className="text-slate-900">按公斤</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">单价</span>
          <span className="font-mono text-slate-900">{numOrDash(d["rate_per_kg"])}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">计费重</span>
          <span className="font-mono text-slate-900">{numOrDash(d["billable_weight_kg"])}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">金额</span>
          <span className="font-mono text-slate-900">{numOrDash(d["amount"])}</span>
        </div>
      </div>
    );
  }

  if (kind === "table") {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-slate-500">方式</span>
          <span className="text-slate-900">阶梯表</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">计费重</span>
          <span className="font-mono text-slate-900">{numOrDash(d["billable_weight_kg"])}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500">金额</span>
          <span className="font-mono text-slate-900">{numOrDash(d["amount"])}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      <div className="flex gap-2">
        <span className="text-slate-500">方式</span>
        <span className="font-mono text-slate-900">{safeText(kind)}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-slate-500">金额</span>
        <span className="font-mono text-slate-900">{numOrDash(d["amount"])}</span>
      </div>
    </div>
  );
}
