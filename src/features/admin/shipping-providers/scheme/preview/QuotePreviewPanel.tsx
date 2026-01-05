// src/features/admin/shipping-providers/scheme/preview/QuotePreviewPanel.tsx
//
// 算价预览（摘要）
// - 调用后端：POST /shipping-quote/calc（单 scheme）
// - Admin 只展示：结果摘要 + 对账摘要
// - reasons/breakdown/raw 等解释能力：迁入 DevConsole → Shipping Pricing Lab

import React, { useMemo, useState } from "react";
import { apiPost } from "../../../../../lib/api";
import type { CalcOut, Dims } from "./types";
import { normalizeAddrPart, toReasonsList } from "./utils";
import { QuotePreviewForm } from "./QuotePreviewForm";
import { QuotePreviewResult } from "./QuotePreviewResult";

export const QuotePreviewPanel: React.FC<{
  schemeId: number;
  disabled?: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  const [province, setProvince] = useState("广东省");
  const [city, setCity] = useState("深圳市");
  const [district, setDistrict] = useState("南山区");

  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [flags, setFlags] = useState(""); // 逗号分隔：bulky,cold,fragile...

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcOut | null>(null);

  const parsedReal = useMemo(() => Number(realWeightKg), [realWeightKg]);

  const dims: Dims | null = useMemo(() => {
    const lt = lengthCm.trim();
    const wt = widthCm.trim();
    const ht = heightCm.trim();
    if (!lt && !wt && !ht) return null;
    if (!lt || !wt || !ht) return null;

    const l = Number(lt);
    const w = Number(wt);
    const h = Number(ht);
    if (!Number.isFinite(l) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
    if (l < 0 || w < 0 || h < 0) return null;

    return { length_cm: l, width_cm: w, height_cm: h };
  }, [lengthCm, widthCm, heightCm]);

  const showDimsWarning = useMemo(() => {
    const any = Boolean(lengthCm.trim() || widthCm.trim() || heightCm.trim());
    if (!any) return false;
    return dims === null;
  }, [lengthCm, widthCm, heightCm, dims]);

  const flagsList = useMemo(() => {
    return flags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [flags]);

  const handleCalc = async () => {
    if (!schemeId) {
      onError("缺少 scheme_id");
      return;
    }
    if (!Number.isFinite(parsedReal) || parsedReal <= 0) {
      onError("real_weight_kg 必须是 > 0 的数字");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const provinceNorm = normalizeAddrPart(province);
      const cityNorm = normalizeAddrPart(city);

      const districtNormRaw = normalizeAddrPart(district);
      const districtNorm = districtNormRaw ? districtNormRaw : null;

      const body: Record<string, unknown> = {
        scheme_id: schemeId,
        dest: {
          province: provinceNorm,
          city: cityNorm,
          district: districtNorm,
        },
        real_weight_kg: parsedReal,
        flags: flagsList,
      };

      if (dims) {
        body["length_cm"] = dims.length_cm;
        body["width_cm"] = dims.width_cm;
        body["height_cm"] = dims.height_cm;
      }

      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);

      // reasons 兼容（不吞错）：确保返回结构在 UI 解释链路上可用（即便 Admin 不展示 reasons）
      toReasonsList(res);

      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "算价失败";
      onError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <QuotePreviewForm
        disabled={disabled}
        loading={loading}
        province={province}
        city={city}
        district={district}
        onChangeProvince={setProvince}
        onChangeCity={setCity}
        onChangeDistrict={setDistrict}
        realWeightKg={realWeightKg}
        onChangeRealWeightKg={setRealWeightKg}
        flags={flags}
        onChangeFlags={setFlags}
        lengthCm={lengthCm}
        widthCm={widthCm}
        heightCm={heightCm}
        onChangeLengthCm={setLengthCm}
        onChangeWidthCm={setWidthCm}
        onChangeHeightCm={setHeightCm}
        showDimsWarning={showDimsWarning}
        onCalc={handleCalc}
      />

      <QuotePreviewResult result={result} />

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={disabled || loading}
          onClick={() => setResult(null)}
          title="清空结果"
        >
          清空结果
        </button>
      </div>
    </div>
  );
};

export default QuotePreviewPanel;
