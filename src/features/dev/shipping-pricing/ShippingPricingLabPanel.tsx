// src/features/dev/shipping-pricing/ShippingPricingLabPanel.tsx
//
// Shipping Pricing Lab（DevConsole 专用）
// - 目标：后端调试 + 算价实验室（解释能力集中）
// - 支持：URL query 自动回填（可复现）
// - 输出：命中 zone/bracket、pricing_mode、reasons、breakdown、raw JSON

import React, { useMemo, useState } from "react";
import { apiPost } from "../../../lib/api";

import type { CalcReq, CalcOut } from "./labTypes";
import { buildExplainSummary, computeDims, dimsWarning, normalizeAddr, normalizeFlags, toNum } from "./labUtils";
import { useLabQuerySync } from "./useLabQuerySync";

import LabRequestForm from "./components/LabRequestForm";
import LabExplainSummary from "./components/LabExplainSummary";
import LabRawJson from "./components/LabRawJson";

export const ShippingPricingLabPanel: React.FC = () => {
  const [schemeIdText, setSchemeIdText] = useState("1");

  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [realWeightKg, setRealWeightKg] = useState("2.36");

  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [flags, setFlags] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState<CalcOut | null>(null);

  // ✅ 从 URL query 自动回填（只做一次）
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

  const schemeId = useMemo(() => {
    const n = toNum(schemeIdText);
    if (n == null) return null;
    return Math.trunc(n);
  }, [schemeIdText]);

  const dims = useMemo(() => computeDims(lengthCm, widthCm, heightCm), [lengthCm, widthCm, heightCm]);
  const warnDims = useMemo(() => dimsWarning(lengthCm, widthCm, heightCm, dims), [lengthCm, widthCm, heightCm, dims]);

  const explain = useMemo(() => buildExplainSummary(out), [out]);

  const handleRun = async () => {
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
    setOut(null);

    const body: CalcReq = {
      scheme_id: schemeId,
      dest: {
        province: normalizeAddr(province),
        city: normalizeAddr(city),
        district: normalizeAddr(district),
      },
      real_weight_kg: w,
      flags: normalizeFlags(flags),
    };

    if (dims) {
      body.length_cm = dims.length_cm;
      body.width_cm = dims.width_cm;
      body.height_cm = dims.height_cm;
    }

    try {
      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);
      setOut(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "calc 调用失败";
      setErr(msg);
      setOut(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Shipping Pricing Lab</div>
        <div className="mt-1 text-sm text-slate-600">
          DevConsole 专用算价实验室：构造请求 → 命中解释（Zone/Bracket）→ reasons/breakdown → 原始 JSON。
        </div>
        <div className="mt-1 text-xs text-slate-500">
          提示：支持 URL query 自动回填（从 Admin “打开 Pricing Lab”跳转可复现同一组输入）。
        </div>
      </div>

      <LabRequestForm
        loading={loading}
        err={err}
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
        onRun={() => void handleRun()}
        onClear={() => setOut(null)}
      />

      <LabExplainSummary s={explain} />

      <LabRawJson out={out} />
    </div>
  );
};

export default ShippingPricingLabPanel;
