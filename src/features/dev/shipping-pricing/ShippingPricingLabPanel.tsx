// src/features/dev/shipping-pricing/ShippingPricingLabPanel.tsx

import React, { useMemo, useState } from "react";
import { apiPost } from "../../../lib/api";

import type { CalcOut, RecommendOut } from "./labTypes";
import { buildExplainSummary, computeDims, dimsWarning, normalizeAddr, normalizeFlags, toNum } from "./labUtils";
import { useLabQuerySync } from "./useLabQuerySync";

import LabRequestForm from "./components/LabRequestForm";
import LabExplainSummary from "./components/LabExplainSummary";
import RecommendCompare from "./components/RecommendCompare";
import LabRawJsonCard from "./components/LabRawJsonCard";

import ReproTools from "./components/ReproTools";
import SchemeHealthScan from "./components/SchemeHealthScan";
import ShippingRecordReconcile from "./components/ShippingRecordReconcile";

export const ShippingPricingLabPanel: React.FC = () => {
  // ===== 输入 =====
  const [schemeIdText, setSchemeIdText] = useState("1");
  const [warehouseIdText, setWarehouseIdText] = useState("");

  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [realWeightKg, setRealWeightKg] = useState("2.36");

  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // ✅ 默认必须空
  const [flags, setFlags] = useState("");

  // ===== 状态 =====
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ===== 输出 =====
  const [calcOut, setCalcOut] = useState<CalcOut | null>(null);

  const [recOut, setRecOut] = useState<RecommendOut | null>(null);
  const [selectedQuoteIdx, setSelectedQuoteIdx] = useState<number>(0);

  // ✅ URL 标准键自动回填（只做一次）
  useLabQuerySync({
    setSchemeIdText,
    setProvince,
    setCity,
    setDistrict,
    setRealWeightKg,
    setFlags,
    setLengthCm,
    setWidthCm,
    setHeightCm,
  });

  // ===== 派生 =====
  const schemeId = useMemo(() => {
    const n = toNum(schemeIdText);
    if (n == null) return null;
    return Math.trunc(n);
  }, [schemeIdText]);

  const warehouseId = useMemo(() => {
    const n = toNum(warehouseIdText);
    if (n == null) return null;
    return Math.trunc(n);
  }, [warehouseIdText]);

  const dims = useMemo(() => computeDims(lengthCm, widthCm, heightCm), [lengthCm, widthCm, heightCm]);
  const warnDims = useMemo(() => dimsWarning(lengthCm, widthCm, heightCm, dims), [lengthCm, widthCm, heightCm, dims]);

  const explain = useMemo(() => buildExplainSummary(calcOut), [calcOut]);

  const dest = useMemo(
    () => ({
      province: normalizeAddr(province),
      city: normalizeAddr(city),
      district: normalizeAddr(district),
    }),
    [province, city, district],
  );

  const flagsList = useMemo(() => normalizeFlags(flags), [flags]);

  const clearAll = () => {
    setErr(null);
    setCalcOut(null);
    setRecOut(null);
    setSelectedQuoteIdx(0);
  };

  // ===== 请求：calc =====
  const handleRunCalc = async () => {
    if (!warehouseId || warehouseId <= 0) {
      setErr("warehouse_id 必须是正整数（起运仓强前置）");
      return;
    }
    if (!schemeId || schemeId <= 0) {
      setErr("scheme_id 必须是正整数");
      return;
    }
    const w = toNum(realWeightKg);
    if (w == null || w <= 0) {
      setErr("real_weight_kg 必须是 > 0 的数字");
      return;
    }

    setErr(null);
    setLoading(true);
    setCalcOut(null);

    const body: Record<string, unknown> = {
      warehouse_id: warehouseId,
      scheme_id: schemeId,
      dest,
      real_weight_kg: w,
      flags: flagsList,
    };

    if (dims) {
      body["length_cm"] = dims.length_cm;
      body["width_cm"] = dims.width_cm;
      body["height_cm"] = dims.height_cm;
    }

    try {
      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);
      setCalcOut(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "calc 调用失败";
      setErr(msg);
      setCalcOut(null);
    } finally {
      setLoading(false);
    }
  };

  // ===== 请求：recommend =====
  const handleRunRecommend = async () => {
    if (!warehouseId || warehouseId <= 0) {
      setErr("warehouse_id 必须是正整数（起运仓强前置）");
      return;
    }
    const w = toNum(realWeightKg);
    if (w == null || w <= 0) {
      setErr("real_weight_kg 必须是 > 0 的数字");
      return;
    }

    setErr(null);
    setLoading(true);
    setRecOut(null);
    setSelectedQuoteIdx(0);

    const body: Record<string, unknown> = {
      warehouse_id: warehouseId,
      provider_ids: [],
      dest,
      real_weight_kg: w,
      flags: flagsList,
      max_results: 10,
    };

    if (dims) {
      body["length_cm"] = dims.length_cm;
      body["width_cm"] = dims.width_cm;
      body["height_cm"] = dims.height_cm;
    }

    try {
      const res = await apiPost<RecommendOut>("/shipping-quote/recommend", body);
      setRecOut(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "recommend 调用失败";
      setErr(msg);
      setRecOut(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Shipping Pricing Lab</div>
        <div className="mt-1 text-sm text-slate-600">calc（解释）+ recommend（对比）+ scan（诊断）+ reconcile（对照）。</div>
      </div>

      <LabRequestForm
        loading={loading}
        err={err}
        warehouseIdText={warehouseIdText}
        setWarehouseIdText={setWarehouseIdText}
        schemeIdText={schemeIdText}
        setSchemeIdText={setSchemeIdText}
        province={province}
        setProvince={setProvince}
        city={city}
        setCity={setCity}
        district={district}
        setDistrict={setDistrict}
        realWeightKg={realWeightKg}
        setRealWeightKg={setRealWeightKg}
        lengthCm={lengthCm}
        setLengthCm={setLengthCm}
        widthCm={widthCm}
        setWidthCm={setWidthCm}
        heightCm={heightCm}
        setHeightCm={setHeightCm}
        flags={flags}
        setFlags={setFlags}
        dimsWarning={warnDims}
        onRunCalc={() => void handleRunCalc()}
        onRunRecommend={() => void handleRunRecommend()}
        onClear={clearAll}
      />

      <ReproTools
        schemeId={schemeId}
        warehouseId={warehouseId}
        province={province}
        city={city}
        district={district}
        realWeightKg={realWeightKg}
        flags={flags}
        lengthCm={lengthCm}
        widthCm={widthCm}
        heightCm={heightCm}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LabExplainSummary s={explain} />
        <RecommendCompare
          recOut={recOut}
          selectedIdx={selectedQuoteIdx}
          onSelect={setSelectedQuoteIdx}
          onUseSchemeIdForCalc={(sid) => setSchemeIdText(String(sid))}
        />
      </div>

      <SchemeHealthScan schemeId={schemeId} />

      <ShippingRecordReconcile
        calcTotalAmount={explain.totalAmount}
        setProvince={setProvince}
        setCity={setCity}
        setDistrict={setDistrict}
        setRealWeightKg={setRealWeightKg}
        setFlags={setFlags}
        setSchemeIdText={setSchemeIdText}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LabRawJsonCard title="calc 原始 JSON（证据）" data={calcOut} />
        <LabRawJsonCard title="recommend 原始 JSON（证据）" data={recOut} />
      </div>
    </div>
  );
};

export default ShippingPricingLabPanel;
