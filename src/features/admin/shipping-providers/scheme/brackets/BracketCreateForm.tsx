// src/features/admin/shipping-providers/scheme/brackets/BracketCreateForm.tsx

import React, { useMemo, useState } from "react";
import { UI } from "../../ui";
import { parseNum, validateRange } from "./validation";

import type { CreateBracketPayload, PricingMode, RoundingMode } from "./bracketCreateTypes";
import { isFiniteNonNeg, normalizeOptionalNum } from "./bracketCreateTypes";
import { buildMirrorPriceJson } from "./buildMirrorPriceJson";

import { BracketRangeFields } from "./BracketRangeFields";
import { BracketModeSelect } from "./BracketModeSelect";
import { BracketFlatParams } from "./BracketFlatParams";
import { BracketLinearTotalParams } from "./BracketLinearTotalParams";
import { BracketRoundingParams } from "./BracketRoundingParams";
import { BracketPriceJsonPreview } from "./BracketPriceJsonPreview";

export type { CreateBracketPayload };

export const BracketCreateForm: React.FC<{
  disabled?: boolean;
  onCreate: (payload: CreateBracketPayload) => Promise<void>;
  onError: (msg: string) => void;
}> = ({ disabled, onCreate, onError }) => {
  // 区间
  const [minKg, setMinKg] = useState("1.01");
  const [maxKg, setMaxKg] = useState("3.0"); // 空=∞

  // 模式（结构化）——只保留：flat / linear_total / manual_quote
  const [mode, setMode] = useState<PricingMode>("linear_total");

  // flat
  const [flatAmount, setFlatAmount] = useState("5.32");

  // linear_total：票费 + 总重*单价
  const [ticketFee, setTicketFee] = useState("0"); // base_amount
  const [ratePerKg, setRatePerKg] = useState("1.0"); // rate_per_kg

  // rounding（可选，覆盖 scheme rounding）
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("ceil");
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
  const parsedTicketFee = useMemo(() => normalizeOptionalNum(ticketFee) ?? NaN, [ticketFee]);
  const parsedRatePerKg = useMemo(() => normalizeOptionalNum(ratePerKg) ?? NaN, [ratePerKg]);
  const parsedRoundingStep = useMemo(() => normalizeOptionalNum(roundingStepKg) ?? NaN, [roundingStepKg]);

  const showRounding = mode === "linear_total";

  // 预览：镜像 price_json（可解释）
  const previewPriceJson = useMemo(() => {
    const rounding =
      showRounding && Number.isFinite(parsedRoundingStep) && parsedRoundingStep > 0
        ? { rounding_mode: roundingMode, rounding_step_kg: parsedRoundingStep }
        : null;

    if (mode === "flat") {
      return buildMirrorPriceJson("flat", { flat_amount: Number.isFinite(parsedFlat) ? parsedFlat : 0 });
    }

    if (mode === "linear_total") {
      return buildMirrorPriceJson("linear_total", {
        base_amount: Number.isFinite(parsedTicketFee) ? parsedTicketFee : 0,
        rate_per_kg: Number.isFinite(parsedRatePerKg) ? parsedRatePerKg : 0,
        rounding_mode: rounding ? rounding.rounding_mode : undefined,
        rounding_step_kg: rounding ? rounding.rounding_step_kg : undefined,
      });
    }

    return buildMirrorPriceJson("manual_quote", {});
  }, [mode, parsedFlat, parsedTicketFee, parsedRatePerKg, showRounding, roundingMode, parsedRoundingStep]);

  const handleCreate = async () => {
    if (parsedMin == null) return onError("min_kg 必须是数字");
    if (rangeErr) return onError(rangeErr);

    // 校验结构化字段
    if (mode === "flat") {
      if (!isFiniteNonNeg(parsedFlat)) return onError("固定价金额必须是 >=0 的数字");
    }

    if (mode === "linear_total") {
      if (!isFiniteNonNeg(parsedTicketFee)) return onError("票费（base_amount）必须是 >=0 的数字");
      if (!isFiniteNonNeg(parsedRatePerKg)) return onError("单价（rate_per_kg）必须是 >=0 的数字");
      if (!Number.isFinite(parsedRoundingStep) || parsedRoundingStep <= 0) return onError("rounding_step_kg 必须是 >0 的数字");
    }

    // payload：结构化字段 + 镜像 price_json（旧字段仍带着）
    const payload: CreateBracketPayload = {
      min_kg: parsedMin,
      max_kg: parsedMax,

      // ✅ 旧字段：让“只看 pricing_kind 的旧工具/页面”也能读懂
      pricing_kind: mode === "flat" ? "flat" : mode === "linear_total" ? "linear_total" : "manual_quote",
      price_json: previewPriceJson,

      // 新字段：结构化真理
      pricing_mode: mode,
    };

    if (mode === "flat") {
      payload.flat_amount = parsedFlat;
    } else if (mode === "linear_total") {
      payload.base_amount = parsedTicketFee;
      payload.rate_per_kg = parsedRatePerKg;
      payload.rounding_mode = roundingMode;
      payload.rounding_step_kg = parsedRoundingStep;
    }

    await onCreate(payload);

    // reset（保留 mode，方便连填）
    setMinKg("1.01");
    setMaxKg("3.0");
    if (mode === "flat") setFlatAmount("5.32");
    if (mode === "linear_total") {
      setTicketFee("0");
      setRatePerKg("1.0");
      setRoundingMode("ceil");
      setRoundingStepKg("1.0");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增重量区间（Bracket）</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <BracketRangeFields
          disabled={disabled}
          minKg={minKg}
          maxKg={maxKg}
          onChangeMin={setMinKg}
          onChangeMax={setMaxKg}
        />

        <BracketModeSelect disabled={disabled} mode={mode} onChange={setMode} />

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled} onClick={() => void handleCreate()}>
            新增 Bracket
          </button>
        </div>
      </div>

      {/* 模式参数 */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        {mode === "flat" ? <BracketFlatParams disabled={disabled} flatAmount={flatAmount} onChange={setFlatAmount} /> : null}

        {mode === "linear_total" ? (
          <BracketLinearTotalParams
            disabled={disabled}
            ticketFee={ticketFee}
            ratePerKg={ratePerKg}
            onChangeTicketFee={setTicketFee}
            onChangeRatePerKg={setRatePerKg}
          />
        ) : null}

        {showRounding ? (
          <BracketRoundingParams
            disabled={disabled}
            roundingMode={roundingMode}
            roundingStepKg={roundingStepKg}
            onChangeMode={setRoundingMode}
            onChangeStep={setRoundingStepKg}
          />
        ) : null}
      </div>

      <BracketPriceJsonPreview value={previewPriceJson} />
    </div>
  );
};

export default BracketCreateForm;
