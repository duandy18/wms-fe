// src/features/admin/shipping-providers/scheme/brackets/BracketCreateForm.tsx

import React, { useMemo, useState } from "react";
import { UI } from "../../ui";
import { parseNum, validateRange } from "./validation";

export type CreateBracketPayload = {
  min_kg: number;
  max_kg: number | null;

  // 兼容字段（旧）
  pricing_kind: string;
  price_json: Record<string, unknown>;

  // Phase 4：结构化字段（新）
  pricing_mode?: "flat" | "per_kg" | "step_over" | "manual_quote";
  flat_amount?: number;

  base_kg?: number;
  base_amount?: number;
  rate_per_kg?: number;

  rounding_mode?: "ceil" | "floor" | "round";
  rounding_step_kg?: number;
};

type PricingMode = "flat" | "per_kg" | "step_over" | "manual_quote";

function isFiniteNonNeg(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

function normalizeOptionalNum(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function buildMirrorPriceJson(
  mode: PricingMode,
  v: {
    flat_amount?: number;
    base_kg?: number;
    base_amount?: number;
    rate_per_kg?: number;
    rounding_mode?: "ceil" | "floor" | "round";
    rounding_step_kg?: number;
  },
): Record<string, unknown> {
  if (mode === "flat") {
    return { kind: "flat", amount: v.flat_amount ?? 0 };
  }
  if (mode === "per_kg") {
    const pj: Record<string, unknown> = {
      kind: "per_kg",
      rate_per_kg: v.rate_per_kg ?? 0,
    };
    if (v.base_amount != null) pj["base_amount"] = v.base_amount;
    if (v.rounding_mode && v.rounding_step_kg != null) {
      pj["rounding"] = { mode: v.rounding_mode, step_kg: v.rounding_step_kg };
    }
    return pj;
  }
  if (mode === "step_over") {
    const pj: Record<string, unknown> = {
      kind: "per_kg_over",
      start_kg: v.base_kg ?? 0,
      base_amount: v.base_amount ?? 0,
      rate_per_kg: v.rate_per_kg ?? 0,
    };
    if (v.rounding_mode && v.rounding_step_kg != null) {
      pj["rounding"] = { mode: v.rounding_mode, step_kg: v.rounding_step_kg };
    }
    return pj;
  }
  return { kind: "manual_quote", message: "manual quote required" };
}

export const BracketCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateBracketPayload) => Promise<void>;
  onError: (msg: string) => void;
}> = ({ disabled, onCreate, onError }) => {
  // 区间
  const [minKg, setMinKg] = useState("1.01");
  const [maxKg, setMaxKg] = useState("3.0"); // 空=∞

  // 模式（结构化）
  const [mode, setMode] = useState<PricingMode>("flat");

  // 固定价
  const [flatAmount, setFlatAmount] = useState("5.32");

  // per_kg
  const [perKgRate, setPerKgRate] = useState("1.0");
  const [perKgBaseAmount, setPerKgBaseAmount] = useState(""); // 可选：起步费/面单费

  // step_over（首重封顶 + 续重）
  const [baseKg, setBaseKg] = useState("3.0");
  const [baseAmount, setBaseAmount] = useState("4.8");
  const [overRatePerKg, setOverRatePerKg] = useState("1.2");

  // rounding（可选，覆盖 scheme rounding）
  const [roundingMode, setRoundingMode] = useState<"ceil" | "floor" | "round">("ceil");
  const [roundingStepKg, setRoundingStepKg] = useState("1.0");

  const parsedMin = useMemo(() => parseNum(minKg), [minKg]);
  const parsedMax = useMemo(() => (maxKg.trim() ? parseNum(maxKg) : null), [maxKg]);

  const rangeErr = useMemo(() => {
    if (parsedMin == null) return "min_kg 不是数字";
    if (parsedMax !== null && parsedMax == null) return "max_kg 不是数字";
    return validateRange(parsedMin, parsedMax);
  }, [parsedMin, parsedMax]);

  // 结构化字段解析
  const parsedFlat = useMemo(() => normalizeOptionalNum(flatAmount) ?? NaN, [flatAmount]);
  const parsedPerKgRate = useMemo(() => normalizeOptionalNum(perKgRate) ?? NaN, [perKgRate]);
  const parsedPerKgBase = useMemo(() => normalizeOptionalNum(perKgBaseAmount), [perKgBaseAmount]);

  const parsedBaseKg = useMemo(() => normalizeOptionalNum(baseKg) ?? NaN, [baseKg]);
  const parsedBaseAmt = useMemo(() => normalizeOptionalNum(baseAmount) ?? NaN, [baseAmount]);
  const parsedOverRate = useMemo(() => normalizeOptionalNum(overRatePerKg) ?? NaN, [overRatePerKg]);

  const parsedRoundingStep = useMemo(() => normalizeOptionalNum(roundingStepKg) ?? NaN, [roundingStepKg]);

  // 预览：镜像 price_json（可解释）
  const previewPriceJson = useMemo(() => {
    const rounding =
      (mode === "per_kg" || mode === "step_over") && Number.isFinite(parsedRoundingStep) && parsedRoundingStep > 0
        ? { rounding_mode: roundingMode, rounding_step_kg: parsedRoundingStep }
        : null;

    if (mode === "flat") {
      return buildMirrorPriceJson("flat", { flat_amount: Number.isFinite(parsedFlat) ? parsedFlat : 0 });
    }

    if (mode === "per_kg") {
      return buildMirrorPriceJson("per_kg", {
        rate_per_kg: Number.isFinite(parsedPerKgRate) ? parsedPerKgRate : 0,
        base_amount: parsedPerKgBase != null && Number.isFinite(parsedPerKgBase) ? parsedPerKgBase : undefined,
        rounding_mode: rounding ? rounding.rounding_mode : undefined,
        rounding_step_kg: rounding ? rounding.rounding_step_kg : undefined,
      });
    }

    if (mode === "step_over") {
      return buildMirrorPriceJson("step_over", {
        base_kg: Number.isFinite(parsedBaseKg) ? parsedBaseKg : 0,
        base_amount: Number.isFinite(parsedBaseAmt) ? parsedBaseAmt : 0,
        rate_per_kg: Number.isFinite(parsedOverRate) ? parsedOverRate : 0,
        rounding_mode: rounding ? rounding.rounding_mode : undefined,
        rounding_step_kg: rounding ? rounding.rounding_step_kg : undefined,
      });
    }

    return buildMirrorPriceJson("manual_quote", {});
  }, [
    mode,
    parsedFlat,
    parsedPerKgRate,
    parsedPerKgBase,
    parsedBaseKg,
    parsedBaseAmt,
    parsedOverRate,
    roundingMode,
    parsedRoundingStep,
  ]);

  const handleCreate = async () => {
    if (parsedMin == null) return onError("min_kg 必须是数字");
    if (rangeErr) return onError(rangeErr);

    // 校验结构化字段
    if (mode === "flat") {
      if (!isFiniteNonNeg(parsedFlat)) return onError("固定价金额必须是 >=0 的数字");
    }

    if (mode === "per_kg") {
      if (!isFiniteNonNeg(parsedPerKgRate)) return onError("rate_per_kg 必须是 >=0 的数字");
      if (parsedPerKgBase != null && !isFiniteNonNeg(parsedPerKgBase)) return onError("base_amount 必须是 >=0 的数字或留空");
      if (!Number.isFinite(parsedRoundingStep) || parsedRoundingStep <= 0) return onError("rounding_step_kg 必须是 >0 的数字");
    }

    if (mode === "step_over") {
      if (!isFiniteNonNeg(parsedBaseKg)) return onError("base_kg（首重阈值）必须是 >=0 的数字");
      if (!isFiniteNonNeg(parsedBaseAmt)) return onError("base_amount（首重封顶价）必须是 >=0 的数字");
      if (!isFiniteNonNeg(parsedOverRate)) return onError("rate_per_kg（续重单价）必须是 >=0 的数字");
      if (!Number.isFinite(parsedRoundingStep) || parsedRoundingStep <= 0) return onError("rounding_step_kg 必须是 >0 的数字");
    }

    // payload：结构化字段 + 镜像 price_json（旧字段仍带着）
    const payload: CreateBracketPayload = {
      min_kg: parsedMin,
      max_kg: parsedMax,

      // ✅ 旧字段：让“只看 pricing_kind 的旧工具/页面”也能读懂
      // - step_over 显式写成 per_kg_over（与 price_json.kind 对齐）
      pricing_kind:
        mode === "flat" ? "flat" :
        mode === "per_kg" ? "per_kg" :
        mode === "step_over" ? "per_kg_over" :
        "manual_quote",
      price_json: previewPriceJson,

      // 新字段：结构化真理
      pricing_mode: mode,
    };

    if (mode === "flat") {
      payload.flat_amount = parsedFlat;
    } else if (mode === "per_kg") {
      payload.rate_per_kg = parsedPerKgRate;
      if (parsedPerKgBase != null) payload.base_amount = parsedPerKgBase;
      payload.rounding_mode = roundingMode;
      payload.rounding_step_kg = parsedRoundingStep;
    } else if (mode === "step_over") {
      payload.base_kg = parsedBaseKg;
      payload.base_amount = parsedBaseAmt;
      payload.rate_per_kg = parsedOverRate;
      payload.rounding_mode = roundingMode;
      payload.rounding_step_kg = parsedRoundingStep;
    }

    await onCreate(payload);

    // reset（保留 mode，方便连填）
    setMinKg("1.01");
    setMaxKg("3.0");
    if (mode === "flat") setFlatAmount("5.32");
  };

  const showRounding = mode === "per_kg" || mode === "step_over";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增重量区间（Bracket）</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">min_kg</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={minKg}
            disabled={disabled}
            onChange={(e) => setMinKg(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">max_kg（空=∞）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={maxKg}
            disabled={disabled}
            onChange={(e) => setMaxKg(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">计价模式（结构化）</label>
          <select
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={mode}
            disabled={disabled}
            onChange={(e) => setMode(e.target.value as PricingMode)}
          >
            <option value="flat">固定价（flat）</option>
            <option value="per_kg">每公斤收费（per_kg）</option>
            <option value="step_over">首重封顶 + 续重（step_over）</option>
            <option value="manual_quote">人工报价（manual_quote）</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            新增 Bracket
          </button>
        </div>
      </div>

      {/* 模式参数 */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        {mode === "flat" ? (
          <>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">固定价金额（flat_amount）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={flatAmount}
                disabled={disabled}
                onChange={(e) => setFlatAmount(e.target.value)}
              />
            </div>
            <div className="md:col-span-4" />
          </>
        ) : null}

        {mode === "per_kg" ? (
          <>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">rate_per_kg（每公斤单价）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={perKgRate}
                disabled={disabled}
                onChange={(e) => setPerKgRate(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">base_amount（起步费，可选）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={perKgBaseAmount}
                disabled={disabled}
                onChange={(e) => setPerKgBaseAmount(e.target.value)}
                placeholder="留空表示 0"
              />
            </div>
            <div className="md:col-span-2" />
          </>
        ) : null}

        {mode === "step_over" ? (
          <>
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">base_kg（首重阈值）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={baseKg}
                disabled={disabled}
                onChange={(e) => setBaseKg(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-slate-600">base_amount（首重封顶价）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={baseAmount}
                disabled={disabled}
                onChange={(e) => setBaseAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">rate_per_kg（续重单价）</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={overRatePerKg}
                disabled={disabled}
                onChange={(e) => setOverRatePerKg(e.target.value)}
              />
            </div>

            <div className="md:col-span-2" />
          </>
        ) : null}

        {showRounding ? (
          <>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">rounding_mode</label>
              <select
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
                value={roundingMode}
                disabled={disabled}
                onChange={(e) => setRoundingMode(e.target.value as any)}
              >
                <option value="ceil">ceil（向上取整）</option>
                <option value="floor">floor（向下取整）</option>
                <option value="round">round（四舍五入）</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-slate-600">rounding_step_kg</label>
              <input
                className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
                value={roundingStepKg}
                disabled={disabled}
                onChange={(e) => setRoundingStepKg(e.target.value)}
              />
            </div>

            <div className="md:col-span-2" />
          </>
        ) : null}
      </div>

      <div className="mt-2 text-sm text-slate-600">
        本表单优先写入结构化字段（pricing_mode / base_kg / base_amount / rate_per_kg / rounding_*），同时生成镜像 price_json 便于审计与兼容。
      </div>

      <pre className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700 overflow-auto">
        {JSON.stringify(previewPriceJson, null, 2)}
      </pre>
    </div>
  );
};
