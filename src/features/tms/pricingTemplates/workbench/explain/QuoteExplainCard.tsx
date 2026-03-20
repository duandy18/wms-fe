// src/features/tms/pricingTemplates/workbench/explain/QuoteExplainCard.tsx

import React, { useMemo, useState } from "react";
import { apiPost } from "../../../../../lib/api";

// ✅ 复用算价表单与结果展示（主线依赖“表单+结果”，不依赖旧 preview 页壳）
import { QuotePreviewForm } from "./QuotePreviewForm";
import { QuotePreviewResult } from "./QuotePreviewResult";
import type { CalcOut, Dims } from "./types";
import { normalizeAddrPart, toReasonsList } from "./utils";

import { useQuoteExplainWarehouses } from "./quote-explain/useQuoteExplainWarehouses";
import { useQuoteExplainGeo } from "./quote-explain/useQuoteExplainGeo";
import {
  calcChargeableWeightKg,
  calcVolumeWeightKg,
  parseDims,
  shouldShowDimsWarning,
} from "./quote-explain/weight";

function readRawErrorMessage(e: unknown): string {
  if (!e) return "";
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return "";
}

function mapCalcErrorToCn(e: unknown, fallback: string): string {
  const raw = readRawErrorMessage(e).trim();
  if (!raw) return fallback;

  const m = raw.toLowerCase();

  if (m.includes("scheme not found")) {
    return "未找到该收费标准，请刷新页面后重试。";
  }

  if (m.includes("scheme archived")) {
    return "该收费标准已归档，不能用于试算；请改用其他方案或先克隆为草稿。";
  }

  if (m.includes("scheme not effective")) {
    return "该收费标准当前未生效或不在有效期内，不能用于试算。";
  }

  if (
    m.includes("no matching zone") ||
    m.includes("no matching destination group")
  ) {
    return "当前目的地未命中任何区域范围，请先检查区域配置。";
  }

  if (m.includes("no matching pricing matrix")) {
    return "当前计费重未命中任何价格矩阵单元格，请先检查重量段与矩阵配置。";
  }

  if (m.includes("only draft scheme can be modified")) {
    return "当前方案不是草稿，不能直接修改；如需编辑，请先克隆为新的草稿方案。";
  }

  return raw;
}

export const QuoteExplainCard: React.FC<{
  schemeId: number;
  disabled: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  // ===== 起运仓（必填前置）=====
  const wh = useQuoteExplainWarehouses({ onError });

  const canCalc = useMemo(() => {
    if (disabled) return false;
    if (wh.whLoading) return false;
    if (
      !Number.isFinite(wh.parsedWarehouseId) ||
      wh.parsedWarehouseId <= 0
    ) {
      return false;
    }
    return true;
  }, [disabled, wh.whLoading, wh.parsedWarehouseId]);

  // ===== 目的地（GB2260）=====
  const geo = useQuoteExplainGeo({ onError });

  // ===== 重量 / flags / 体积 =====
  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [flags, setFlags] = useState("");

  const dims: Dims | null = useMemo(
    () => parseDims({ lengthCm, widthCm, heightCm }),
    [lengthCm, widthCm, heightCm],
  );

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
    if (
      !Number.isFinite(wh.parsedWarehouseId) ||
      wh.parsedWarehouseId <= 0
    ) {
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
    if (
      chargeableWeightKg == null ||
      !Number.isFinite(chargeableWeightKg) ||
      chargeableWeightKg <= 0
    ) {
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
      onError(mapCalcErrorToCn(e, "算价失败，请稍后重试。"));
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
