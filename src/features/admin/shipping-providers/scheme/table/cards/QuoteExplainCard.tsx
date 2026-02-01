// src/features/admin/shipping-providers/scheme/table/cards/QuoteExplainCard.tsx

import React, { useMemo, useState } from "react";
import { apiPost } from "../../../../../../lib/api";

// ✅ 复用算价表单与结果展示（主线依赖“表单+结果”，不依赖 preview tab 页面）
import { QuotePreviewForm } from "../../preview/QuotePreviewForm";
import { QuotePreviewResult } from "../../preview/QuotePreviewResult";
import type { CalcOut, Dims } from "../../preview/types";
import { normalizeAddrPart, toReasonsList } from "../../preview/utils";

import { useQuoteExplainWarehouses } from "./quote-explain/useQuoteExplainWarehouses";
import { useQuoteExplainGeo } from "./quote-explain/useQuoteExplainGeo";
import { calcChargeableWeightKg, calcVolumeWeightKg, parseDims, shouldShowDimsWarning } from "./quote-explain/weight";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

export const QuoteExplainCard: React.FC<{
  schemeId: number;
  disabled: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  // ===== 起运仓（必填前置） =====
  const wh = useQuoteExplainWarehouses({ onError });

  const canCalc = useMemo(() => {
    if (disabled) return false;
    if (wh.whLoading) return false;
    if (!Number.isFinite(wh.parsedWarehouseId) || wh.parsedWarehouseId <= 0) return false;
    return true;
  }, [disabled, wh.whLoading, wh.parsedWarehouseId]);

  // ===== 目的地（GB2260） =====
  const geo = useQuoteExplainGeo({ onError });

  // ===== 重量 / flags / 体积 =====
  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [flags, setFlags] = useState("");

  const dims: Dims | null = useMemo(() => parseDims({ lengthCm, widthCm, heightCm }), [lengthCm, widthCm, heightCm]);

  const showDimsWarning = useMemo(() => {
    return shouldShowDimsWarning({ lengthCm, widthCm, heightCm, dims });
  }, [lengthCm, widthCm, heightCm, dims]);

  const volumeWeightKg = useMemo(() => calcVolumeWeightKg(dims), [dims]);

  const chargeableWeightKg = useMemo(() => {
    return calcChargeableWeightKg({ realWeightKg, volumeWeightKg });
  }, [realWeightKg, volumeWeightKg]);

  const usingDims = useMemo(() => {
    return volumeWeightKg != null && chargeableWeightKg != null;
  }, [volumeWeightKg, chargeableWeightKg]);

  const flagsList = useMemo(() => {
    const v = String(flags ?? "").trim();
    return v ? [v] : [];
  }, [flags]);

  // ===== 结果 =====
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcOut | null>(null);

  const handleCalc = async () => {
    if (!schemeId || schemeId <= 0) {
      onError("缺少 scheme_id");
      return;
    }
    if (!Number.isFinite(wh.parsedWarehouseId) || wh.parsedWarehouseId <= 0) {
      onError("请先选择起运仓");
      return;
    }
    if (!geo.provinceCode || !geo.cityCode) {
      onError("请先选择省/市");
      return;
    }
    if (!geo.provinceName || !geo.cityName) {
      onError("省/市名称解析失败：请刷新后重试");
      return;
    }
    if (chargeableWeightKg == null || !Number.isFinite(chargeableWeightKg) || chargeableWeightKg <= 0) {
      onError("计费重必须是 > 0 的数字（请检查实重/体积重输入）");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        scheme_id: schemeId,
        warehouse_id: wh.parsedWarehouseId,

        dest: {
          // ✅ 白盒事实：同时给 name + code（后端以 code 为真相）
          province: normalizeAddrPart(geo.provinceName),
          city: normalizeAddrPart(geo.cityName),
          district: null, // ✅ 主线不收集区/县
          province_code: geo.provinceCode,
          city_code: geo.cityCode,
        },

        real_weight_kg: chargeableWeightKg,
        flags: flagsList,
      };

      if (dims) {
        body["length_cm"] = dims.length_cm;
        body["width_cm"] = dims.width_cm;
        body["height_cm"] = dims.height_cm;
      }

      const res = await apiPost<CalcOut>("/shipping-quote/calc", body);
      toReasonsList(res);
      setResult(res);
    } catch (e: unknown) {
      onError(toHumanError(e, "算价失败"));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="text-base font-semibold text-slate-900">算价与解释</div>

      <QuotePreviewForm
        disabled={disabled}
        loading={loading}
        warehouseId={wh.warehouseId}
        warehouseOptions={wh.warehouseOptions}
        warehousesLoading={wh.whLoading}
        warehousesError={wh.whError}
        onChangeWarehouseId={wh.setWarehouseId}
        onReloadWarehouses={() => void wh.reload()}
        canCalc={canCalc}
        geoLoading={geo.geoLoading}
        provinces={geo.provinces}
        cities={geo.cities}
        provinceCode={geo.provinceCode}
        cityCode={geo.cityCode}
        onChangeProvinceCode={geo.onChangeProvinceCode}
        onChangeCityCode={geo.setCityCode}
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
        volumeWeightKg={volumeWeightKg}
        chargeableWeightKg={chargeableWeightKg}
        usingDims={usingDims}
        onCalc={handleCalc}
      />

      <QuotePreviewResult result={result} />
    </div>
  );
};

export default QuoteExplainCard;
