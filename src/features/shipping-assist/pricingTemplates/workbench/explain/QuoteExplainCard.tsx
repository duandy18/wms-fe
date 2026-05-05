// src/features/shipping-assist/pricingTemplates/workbench/explain/QuoteExplainCard.tsx

import React, { useMemo, useState } from "react";

// 保留表单用于配置上下文展示；WMS 已退役报价运行接口，不再从这里请求试算。
import { QuotePreviewForm } from "./QuotePreviewForm";
import type { Dims } from "./types";

import { useQuoteExplainWarehouses } from "./quote-explain/useQuoteExplainWarehouses";
import { useQuoteExplainGeo } from "./quote-explain/useQuoteExplainGeo";
import {
  calcChargeableWeightKg,
  calcVolumeWeightKg,
  parseDims,
  shouldShowDimsWarning,
} from "./quote-explain/weight";

export const QuoteExplainCard: React.FC<{
  templateId: number;
  disabled: boolean;
  onError: (msg: string) => void;
}> = ({ templateId, disabled, onError }) => {
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

  const geo = useQuoteExplainGeo({ onError });

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

  const handleCalc = () => {
    if (!templateId || templateId <= 0) {
      onError("缺少模板 ID");
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

    onError("报价预览运行能力已迁移到 Logistics 系统；WMS 仅保留运价配置，不再发起本地试算。");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-base font-semibold text-slate-900">算价与解释</div>
        <div className="mt-1 text-sm text-slate-500">
          WMS 当前只维护运价配置；报价试算与发货执行已经迁移到 Logistics 系统。
        </div>
      </div>

      <QuotePreviewForm
        disabled={disabled}
        loading={false}
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

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
        本卡片保留为运价表配置辅助说明；需要真实报价、推荐快递公司、申请运单号时，请进入 Logistics 系统。
      </div>
    </div>
  );
};

export default QuoteExplainCard;
