// src/features/admin/shipping-providers/scheme/preview/QuotePreviewForm.tsx

import React, { useMemo } from "react";
import { UI } from "../../ui";

export type GeoItem = { code: string; name: string };

function fmtKg(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export const QuotePreviewForm: React.FC<{
  disabled?: boolean;
  loading: boolean;

  warehouseId: string;
  warehouseOptions: Array<{ id: number; label: string }>;
  warehousesLoading: boolean;
  warehousesError: string | null;
  onChangeWarehouseId: (v: string) => void;
  onReloadWarehouses: () => void;
  canCalc: boolean;

  // ✅ 目的地：全量行政区划（GB2260）
  geoLoading: boolean;
  provinces: GeoItem[];
  cities: GeoItem[];
  provinceCode: string;
  cityCode: string;
  onChangeProvinceCode: (v: string) => void;
  onChangeCityCode: (v: string) => void;

  realWeightKg: string;
  onChangeRealWeightKg: (v: string) => void;

  flags: string;
  onChangeFlags: (v: string) => void;

  lengthCm: string;
  widthCm: string;
  heightCm: string;
  onChangeLengthCm: (v: string) => void;
  onChangeWidthCm: (v: string) => void;
  onChangeHeightCm: (v: string) => void;

  showDimsWarning: boolean;

  // ✅ 体积重/计费重（由上层计算）
  volumeWeightKg: number | null;
  chargeableWeightKg: number | null;
  usingDims: boolean;

  onCalc: () => void;
}> = ({
  disabled,
  loading,

  warehouseId,
  warehouseOptions,
  warehousesLoading,
  warehousesError,
  onChangeWarehouseId,
  onReloadWarehouses,
  canCalc,

  geoLoading,
  provinces,
  cities,
  provinceCode,
  cityCode,
  onChangeProvinceCode,
  onChangeCityCode,

  realWeightKg,
  onChangeRealWeightKg,
  flags,
  onChangeFlags,
  lengthCm,
  onChangeLengthCm,
  widthCm,
  onChangeWidthCm,
  heightCm,
  onChangeHeightCm,
  showDimsWarning,

  volumeWeightKg,
  chargeableWeightKg,
  usingDims,

  onCalc,
}) => {
  const calcDisabledReason = useMemo(() => {
    if (disabled) return "当前为只读/禁用状态";
    if (loading) return "正在算价中…";
    if (!canCalc) return "请先选择起运仓";
    if (geoLoading) return "正在加载省市数据…";
    if (!provinceCode || !cityCode) return "请先选择省/市";
    return null;
  }, [disabled, loading, canCalc, geoLoading, provinceCode, cityCode]);

  const calcDisabled = useMemo(() => {
    return calcDisabledReason != null;
  }, [calcDisabledReason]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      {/* 起运仓 */}
      <div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-slate-600">起运仓 *</label>
            <select
              className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
              value={warehouseId}
              disabled={disabled || warehousesLoading}
              onChange={(e) => onChangeWarehouseId(e.target.value)}
            >
              <option value="">请选择起运仓…</option>
              {warehouseOptions.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.label}
                </option>
              ))}
            </select>
            {warehousesError ? <div className="mt-2 text-sm text-red-600">{warehousesError}</div> : null}
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className={UI.btnSecondary}
              disabled={disabled || warehousesLoading}
              onClick={onReloadWarehouses}
              title="刷新起运仓列表"
            >
              {warehousesLoading ? "加载中…" : "刷新仓库"}
            </button>
          </div>
        </div>
      </div>

      {/* 目的地（GB2260 下拉） */}
      <div>
        <div className="text-sm font-semibold text-slate-800">目的地</div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">省 *</label>
            <select
              className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
              value={provinceCode}
              disabled={disabled || geoLoading}
              onChange={(e) => onChangeProvinceCode(e.target.value)}
            >
              <option value="">{geoLoading ? "加载中…" : "请选择省份（code）"}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}（{p.code}）
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-slate-600">市 *</label>
            <select
              className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
              value={cityCode}
              disabled={disabled || geoLoading || !provinceCode}
              onChange={(e) => onChangeCityCode(e.target.value)}
            >
              <option value="">{!provinceCode ? "请先选择省份" : geoLoading ? "加载中…" : "请选择城市（code）"}</option>
              {cities.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}（{c.code}）
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 重量 & 货物特征 */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">实重（kg）*</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={realWeightKg}
            disabled={disabled}
            onChange={(e) => onChangeRealWeightKg(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">货物特征（flags）</label>
          <select
            className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
            value={flags}
            disabled={disabled}
            onChange={(e) => onChangeFlags(e.target.value)}
          >
            <option value="">普通货物</option>
            <option value="bulky">异形件</option>
            <option value="irregular">不规则</option>
            <option value="cold">冷链</option>
            <option value="fragile">易碎</option>
          </select>
        </div>
      </div>

      {/* 体积 */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">长（cm）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={lengthCm}
            disabled={disabled}
            onChange={(e) => onChangeLengthCm(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">宽（cm）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={widthCm}
            disabled={disabled}
            onChange={(e) => onChangeWidthCm(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">高（cm）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={heightCm}
            disabled={disabled}
            onChange={(e) => onChangeHeightCm(e.target.value)}
          />
        </div>

        <div className="flex flex-col items-end">
          <button
            className={UI.btnPrimaryGreen}
            type="button"
            disabled={calcDisabled}
            onClick={onCalc}
            title={calcDisabledReason ?? ""}
          >
            {loading ? "算价中…" : "开始算价"}
          </button>

          {calcDisabledReason ? (
            <div className="mt-2 text-[11px] text-slate-500">{calcDisabledReason}</div>
          ) : (
            <div className="mt-2 text-[11px] text-slate-500">已就绪：可开始算价</div>
          )}
        </div>
      </div>

      {!showDimsWarning ? null : <div className="mt-2 text-sm text-amber-700">体积重输入不完整</div>}

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            体积重（kg）=<span className="font-mono mx-1">{fmtKg(volumeWeightKg)}</span>
            <span className="text-slate-500">（长×宽×高/8000）</span>
          </div>
          <div>
            计费重（kg）=<span className="font-mono mx-1">{fmtKg(chargeableWeightKg)}</span>
            <span className="text-slate-500">（取实重与体积重较大者）</span>
          </div>
          {usingDims ? <span className="text-emerald-700 font-semibold">已按计费重算价</span> : <span className="text-slate-500">未使用体积重</span>}
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewForm;
