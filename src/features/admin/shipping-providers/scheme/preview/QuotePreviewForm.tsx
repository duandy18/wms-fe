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

  // “重点城市下拉”选项：省会/首府（若存在） + KEY_CITIES（去重）
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">输入条件</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">省（标准值）</label>
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
          <div className="mt-1 text-xs text-slate-500">建议：省必须标准化（下拉），否则 Zone 命中会很容易失败。</div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">重点城市（仅用于少量附加费/特例）</label>
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
            <option value="">— 不选择（可手输）—</option>
            {keyCityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-slate-500">
            重点城市来自系统内置白名单（省会/首府 + 深圳）。选中后会写入“市”字段。
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-slate-600">市（可手输，非重点城市时用）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base"
            value={city}
            disabled={disabled}
            onChange={(e) => onChangeCity(e.target.value)}
            onBlur={() => {
              const norm = normalizeSpaces(city);
              if (norm !== city) onChangeCity(norm);
            }}
            placeholder="例如：哈尔滨市 / 哈尔滨"
          />
          <div className="mt-1 text-xs text-slate-500">
            当前规则多数只看省；市主要用于“重点城市附加费/特例”。（会自动去空格）
          </div>
        </div>
      </div>

      <details className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          高级（可选）：区/县（目前多数规则不使用）
        </summary>

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
              placeholder="例如：南山区"
            />
            <div className="mt-1 text-xs text-slate-500">
              提交时会自动去掉空格；若留空，将按“不提供区县”处理（更贴合目前规则）。
            </div>
          </div>
          <div className="md:col-span-2" />
        </div>
      </details>

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
          <label className="text-sm text-slate-600">flags（逗号分隔，可选）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={flags}
            disabled={disabled}
            onChange={(e) => onChangeFlags(e.target.value)}
            placeholder="例如：bulky,cold"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">长（cm，可选）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={lengthCm}
            disabled={disabled}
            onChange={(e) => onChangeLengthCm(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">宽（cm，可选）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={widthCm}
            disabled={disabled}
            onChange={(e) => onChangeWidthCm(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-slate-600">高（cm，可选）</label>
          <input
            className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
            value={heightCm}
            disabled={disabled}
            onChange={(e) => onChangeHeightCm(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <button className={UI.btnPrimaryGreen} type="button" disabled={disabled || loading} onClick={onCalc}>
            {loading ? "算价中…" : "开始算价"}
          </button>
        </div>
      </div>

      {!showDimsWarning ? null : (
        <div className="mt-2 text-sm text-amber-700">体积重：需要同时填写 长/宽/高 三项才会参与计算（否则按未填写处理）。</div>
      )}
    </div>
  );
};
