// src/features/admin/shipping-providers/scheme/preview/QuotePreviewForm.tsx

import React, { useMemo } from "react";
import { UI } from "../../ui";
import { KEY_CITIES, PROVINCE_CAPITAL_CITY } from "../surcharges/data/keyCities";

const PROVINCE_OPTIONS: string[] = [
  "北京市",
  "天津市",
  "上海市",
  "重庆市",
  "河北省",
  "山西省",
  "辽宁省",
  "吉林省",
  "黑龙江省",
  "江苏省",
  "浙江省",
  "安徽省",
  "福建省",
  "江西省",
  "山东省",
  "河南省",
  "湖北省",
  "湖南省",
  "广东省",
  "海南省",
  "四川省",
  "贵州省",
  "云南省",
  "陕西省",
  "甘肃省",
  "青海省",
  "内蒙古自治区",
  "广西壮族自治区",
  "西藏自治区",
  "宁夏回族自治区",
  "新疆维吾尔自治区",
  "香港特别行政区",
  "澳门特别行政区",
  "台湾省",
];

function normalizeSpaces(s: string): string {
  const t = (s ?? "").trim();
  return t.replace(/\s+/g, "");
}

export const QuotePreviewForm: React.FC<{
  disabled?: boolean;
  loading: boolean;

  // ✅ Phase 4.x 合同：起运仓强前置（warehouse_id）
  warehouseId: string;
  warehouseOptions: Array<{ id: number; label: string }>;
  warehousesLoading: boolean;
  warehousesError: string | null;
  onChangeWarehouseId: (v: string) => void;
  onReloadWarehouses: () => void;
  canCalc: boolean;

  province: string;
  city: string;
  district: string;
  onChangeProvince: (v: string) => void;
  onChangeCity: (v: string) => void;
  onChangeDistrict: (v: string) => void;

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

  province,
  city,
  district,
  onChangeProvince,
  onChangeCity,
  onChangeDistrict,
  realWeightKg,
  onChangeRealWeightKg,
  flags,
  onChangeFlags,
  lengthCm,
  widthCm,
  heightCm,
  onChangeLengthCm,
  onChangeWidthCm,
  onChangeHeightCm,
  showDimsWarning,
  onCalc,
}) => {
  const capitalCity = useMemo(() => PROVINCE_CAPITAL_CITY[province] ?? "", [province]);

  const keyCityOptions = useMemo(() => {
    const set = new Set<string>();
    if (capitalCity) set.add(capitalCity);
    for (const c of KEY_CITIES) set.add(c);
    return Array.from(set);
  }, [capitalCity]);

  const selectedKeyCity = useMemo(() => {
    return keyCityOptions.includes(city) ? city : "";
  }, [city, keyCityOptions]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
      {/* ✅ 起运仓（强前置） */}
      <div>
        <div className="text-sm font-semibold text-slate-800">起运仓（强前置）</div>
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

        {!warehouseId ? (
          <div className="mt-2 text-sm text-amber-700">未选择起运仓时，禁止算价（warehouse_id 为强前置）。</div>
        ) : null}
      </div>

      {/* 目的地 */}
      <div>
        <div className="text-sm font-semibold text-slate-800">目的地</div>

        {/* 省 / 城市 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">省</label>
            <select
              className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
              value={province}
              disabled={disabled}
              onChange={(e) => onChangeProvince(e.target.value)}
            >
              {PROVINCE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-600">重点城市</label>
            <select
              className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base"
              value={selectedKeyCity}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                onChangeCity(v);
              }}
            >
              <option value="">—</option>
              {keyCityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-slate-600">市</label>
            <input
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
              value={city}
              disabled={disabled}
              onChange={(e) => onChangeCity(e.target.value)}
              onBlur={() => {
                const norm = normalizeSpaces(city);
                if (norm !== city) onChangeCity(norm);
              }}
            />
          </div>
        </div>

        {/* 区/县 */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm text-slate-600">区/县</label>
            <input
              className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
              value={district}
              disabled={disabled}
              onChange={(e) => onChangeDistrict(e.target.value)}
              onBlur={() => {
                const norm = normalizeSpaces(district);
                if (norm !== district) onChangeDistrict(norm);
              }}
            />
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

        <div className="flex items-end">
          <button
            className={UI.btnPrimaryGreen}
            type="button"
            disabled={disabled || loading || !canCalc}
            onClick={onCalc}
            title={!canCalc ? "请先选择起运仓（warehouse_id）" : ""}
          >
            {loading ? "算价中…" : "开始算价"}
          </button>
        </div>
      </div>

      {!showDimsWarning ? null : <div className="mt-2 text-sm text-amber-700">体积重输入不完整</div>}
    </div>
  );
};

export default QuotePreviewForm;
