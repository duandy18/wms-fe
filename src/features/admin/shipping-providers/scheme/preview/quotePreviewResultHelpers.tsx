// src/features/admin/shipping-providers/scheme/preview/quotePreviewResultHelpers.tsx

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
 * 目标：固定价格 / 线性价格 / 首重/续重
 * 依据：后端 bracket 字段（flat_amount/base_amount/rate_per_kg/pricing_mode）
 */
export function resolvePricingModelCn(bracket: CalcOut["bracket"]): string {
  const raw = safeText(bracket?.pricing_mode).trim().toLowerCase();
  const flat = bracket?.flat_amount ?? null;
  const base = bracket?.base_amount ?? null;
  const rate = bracket?.rate_per_kg ?? null;

  // 固定价格
  if (flat != null || raw === "flat") return "固定价格";

  // 首重/续重：base + rate 同时存在
  if (base != null && rate != null) return "首重/续重";

  // 线性价格：linear_total 或只有 rate
  if (raw === "linear_total" || rate != null) return "线性价格";

  // 兜底：不解释，原样
  return raw ? safeText(raw) : "—";
}

/* ---------- condition / detail render ---------- */

export function renderConditionCn(condition: unknown): React.ReactNode {
  const cond = isRecord(condition) ? condition : {};

  const destRaw = cond["dest"];
  const dest = isRecord(destRaw) ? destRaw : {};
  const provs = asStringArray(dest["province"]);
  const cities = asStringArray(dest["city"]);
  const dists = asStringArray(dest["district"]);

  const flagAny = asStringArray(cond["flag_any"]);

  const hasAny = provs.length || cities.length || dists.length || flagAny.length;
  if (!hasAny) return <span className="text-slate-600">—</span>;

  return (
    <div className="space-y-1 text-sm">
      {provs.length ? (
        <div className="flex gap-2">
          <span className="text-slate-500">省</span>
          <span className="text-slate-900">{joinOrDash(provs)}</span>
        </div>
      ) : null}

      {cities.length ? (
        <div className="flex gap-2">
          <span className="text-slate-500">市</span>
          <span className="text-slate-900">{joinOrDash(cities)}</span>
        </div>
      ) : null}

      {dists.length ? (
        <div className="flex gap-2">
          <span className="text-slate-500">区/县</span>
          <span className="text-slate-900">{joinOrDash(dists)}</span>
        </div>
      ) : null}

      {flagAny.length ? (
        <div className="flex gap-2">
          <span className="text-slate-500">特征</span>
          <span className="font-mono text-slate-900">{joinOrDash(flagAny)}</span>
        </div>
      ) : null}
    </div>
  );
}

export function renderDetailCn(detail: unknown): React.ReactNode {
  const d = isRecord(detail) ? detail : {};
  const kind = String(d["kind"] ?? "").trim().toLowerCase();

  if (!kind) return <span className="text-slate-600">—</span>;

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
