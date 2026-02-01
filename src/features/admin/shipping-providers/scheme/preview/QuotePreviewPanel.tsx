// src/features/admin/shipping-providers/scheme/preview/QuotePreviewPanel.tsx
//
// 算价预览（摘要）
// - 调用后端：POST /shipping-quote/calc（单 scheme）
// - Admin 只展示：结果摘要 + 对账摘要
// - reasons/breakdown/raw 等解释能力：迁入 DevConsole → Shipping Pricing Lab
//
// ✅ 合同：起运仓为必填前置
// - 前端不得绕过仓库边界发起报价
// - 不做 fallback，不做默认全仓可用

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../../../../../lib/api";
import type { CalcOut, Dims } from "./types";
import { normalizeAddrPart, toReasonsList } from "./utils";
import { QuotePreviewForm, type GeoItem } from "./QuotePreviewForm";
import { QuotePreviewResult } from "./QuotePreviewResult";

// ✅ 复用仓库域现有接口：不引入新后端能力
import { fetchActiveWarehouses } from "../../../warehouses/api";
import type { WarehouseListItem } from "../../../warehouses/types";

function toHumanError(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  const r = e as Record<string, unknown>;
  if (typeof r?.message === "string") return r.message;
  return fallback;
}

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code || name || `WH-${w.id}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const QuotePreviewPanel: React.FC<{
  schemeId: number;
  disabled?: boolean;
  onError: (msg: string) => void;
}> = ({ schemeId, disabled, onError }) => {
  // ✅ 起运仓（必填前置）
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [whLoading, setWhLoading] = useState(false);
  const [whError, setWhError] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>("");

  async function loadWarehouses() {
    setWhLoading(true);
    setWhError(null);
    try {
      const list = await fetchActiveWarehouses();
      setWarehouses(list ?? []);
    } catch (e) {
      const msg = toHumanError(e, "加载起运仓失败");
      setWhError(msg);
      setWarehouses([]);
    } finally {
      setWhLoading(false);
    }
  }

  useEffect(() => {
    void loadWarehouses();
  }, []);

  // 如果仓库列表变化且当前选择已不存在，清空选择（避免隐式 fallback）
  useEffect(() => {
    if (!warehouseId) return;
    const wid = Number(warehouseId);
    if (!Number.isFinite(wid) || wid <= 0) return;
    const ok = warehouses.some((w) => w.id === wid);
    if (!ok) setWarehouseId("");
  }, [warehouses, warehouseId]);

  const warehouseOptions = useMemo(() => {
    const arr = [...warehouses];
    arr.sort((a, b) => warehouseLabel(a).localeCompare(warehouseLabel(b), "zh"));
    return arr.map((w) => ({ id: w.id, label: warehouseLabel(w) }));
  }, [warehouses]);

  const parsedWarehouseId = useMemo(() => {
    const n = Number(warehouseId);
    return Number.isFinite(n) ? n : NaN;
  }, [warehouseId]);

  const canCalc = useMemo(() => {
    if (disabled) return false;
    if (whLoading) return false;
    if (!Number.isFinite(parsedWarehouseId) || parsedWarehouseId <= 0) return false;
    return true;
  }, [disabled, whLoading, parsedWarehouseId]);

  // ✅ 目的地（GB2260 下拉）
  const [geoLoading, setGeoLoading] = useState(false);
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("");

  const provinceName = useMemo(() => {
    const hit = provinces.find((x) => x.code === provinceCode);
    return hit?.name ?? "";
  }, [provinces, provinceCode]);

  const cityName = useMemo(() => {
    const hit = cities.find((x) => x.code === cityCode);
    return hit?.name ?? "";
  }, [cities, cityCode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGeoLoading(true);
      try {
        const list = await apiGet<GeoItem[]>("/geo/provinces");
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : [];
        setProvinces(arr);

        // 给个默认：优先广东省，否则第一个
        if (!provinceCode && arr.length) {
          const gd = arr.find((x) => x.name === "广东省") ?? arr[0];
          setProvinceCode(gd.code);
          setCityCode("");
        }
      } catch (e) {
        if (!cancelled) onError(toHumanError(e, "加载省份失败"));
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!provinceCode) {
        setCities([]);
        setCityCode("");
        return;
      }
      setGeoLoading(true);
      try {
        const list = await apiGet<GeoItem[]>(`/geo/provinces/${provinceCode}/cities`);
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : [];
        setCities(arr);

        // 默认：优先深圳市，否则第一个
        if (arr.length) {
          const sz = arr.find((x) => x.name === "深圳市") ?? arr[0];
          setCityCode((prev) => (prev ? prev : sz.code));
        } else {
          setCityCode("");
        }
      } catch (e) {
        if (!cancelled) onError(toHumanError(e, "加载城市失败"));
      } finally {
        if (!cancelled) setGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceCode, onError]);

  // 重量 / 体积
  const [realWeightKg, setRealWeightKg] = useState("2.36");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const [flags, setFlags] = useState("");

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
    if (l <= 0 || w <= 0 || h <= 0) return null;

    return { length_cm: l, width_cm: w, height_cm: h };
  }, [lengthCm, widthCm, heightCm]);

  const showDimsWarning = useMemo(() => {
    const any = Boolean(lengthCm.trim() || widthCm.trim() || heightCm.trim());
    if (!any) return false;
    return dims === null;
  }, [lengthCm, widthCm, heightCm, dims]);

  const volumeWeightKg = useMemo(() => {
    if (!dims) return null;
    const vw = (dims.length_cm * dims.width_cm * dims.height_cm) / 8000;
    if (!Number.isFinite(vw) || vw <= 0) return null;
    return round2(vw);
  }, [dims]);

  const chargeableWeightKg = useMemo(() => {
    const realOk = Number.isFinite(parsedReal) && parsedReal > 0;
    const volOk = volumeWeightKg != null && Number.isFinite(volumeWeightKg) && volumeWeightKg > 0;

    if (!realOk && !volOk) return null;
    if (!realOk && volOk) return volumeWeightKg!;
    if (realOk && !volOk) return round2(parsedReal);
    return round2(Math.max(parsedReal, volumeWeightKg!));
  }, [parsedReal, volumeWeightKg]);

  const usingDims = useMemo(() => {
    return volumeWeightKg != null && chargeableWeightKg != null;
  }, [volumeWeightKg, chargeableWeightKg]);

  const flagsList = useMemo(() => {
    const v = String(flags ?? "").trim();
    return v ? [v] : [];
  }, [flags]);

  const handleCalc = async () => {
    if (!schemeId) {
      onError("缺少 scheme_id");
      return;
    }

    if (!Number.isFinite(parsedWarehouseId) || parsedWarehouseId <= 0) {
      onError("请先选择起运仓");
      return;
    }

    if (!provinceCode || !cityCode) {
      onError("请先选择省/市");
      return;
    }
    if (!provinceName || !cityName) {
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
        warehouse_id: parsedWarehouseId,
        dest: {
          province: normalizeAddrPart(provinceName),
          city: normalizeAddrPart(cityName),
          district: null,
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
    <div className="space-y-4">
      <QuotePreviewForm
        disabled={disabled}
        loading={loading}
        warehouseId={warehouseId}
        warehouseOptions={warehouseOptions}
        warehousesLoading={whLoading}
        warehousesError={whError}
        onChangeWarehouseId={setWarehouseId}
        onReloadWarehouses={() => void loadWarehouses()}
        canCalc={canCalc}
        geoLoading={geoLoading}
        provinces={provinces}
        cities={cities}
        provinceCode={provinceCode}
        cityCode={cityCode}
        onChangeProvinceCode={(v) => {
          setProvinceCode(v);
          setCityCode("");
        }}
        onChangeCityCode={setCityCode}
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
