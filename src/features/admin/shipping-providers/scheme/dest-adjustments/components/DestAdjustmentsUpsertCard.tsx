// src/features/admin/shipping-providers/scheme/dest-adjustments/components/DestAdjustmentsUpsertCard.tsx
import React, { useMemo, useState } from "react";
import type { GeoItem } from "../../../api/geo";

type Scope = "province" | "city";

function toNum(v: string): number | null {
  const x = Number(v);
  if (!Number.isFinite(x)) return null;
  return x;
}

export const DestAdjustmentsUpsertCard: React.FC<{
  disabled: boolean;
  busy: boolean;
  geoLoading: boolean;

  scope: Scope;
  setScope: (v: Scope) => void;

  provinces: GeoItem[];
  cities: GeoItem[];
  provinceCode: string;
  setProvinceCode: (v: string) => void;
  cityCode: string;
  setCityCode: (v: string) => void;

  provinceName: string | null;
  cityName: string | null;

  onError: (msg: string) => void;
  onSubmit: (payload: {
    scope: Scope;
    province_code: string;
    city_code?: string | null;
    province_name?: string | null;
    city_name?: string | null;
    amount: number;
    active?: boolean;
    priority?: number;
  }) => Promise<void>;
}> = (p) => {
  const [amountText, setAmountText] = useState("");

  const canSelect = !p.disabled && !p.busy && !p.geoLoading;

  const cityDisabled = useMemo(() => {
    if (!canSelect) return true;
    if (p.scope !== "city") return true;
    if (!p.provinceCode) return true;
    return false;
  }, [canSelect, p.scope, p.provinceCode]);

  async function submit() {
    if (p.disabled || p.busy) return;

    if (!p.provinceCode) {
      p.onError("请选择省份");
      return;
    }
    if (p.scope === "city" && !p.cityCode) {
      p.onError("请选择城市");
      return;
    }

    const amt = toNum(amountText);
    if (amt == null || amt < 0) {
      p.onError("金额必须是 >= 0 的数字");
      return;
    }

    await p.onSubmit({
      scope: p.scope,
      province_code: p.provinceCode,
      city_code: p.scope === "city" ? p.cityCode : null,
      province_name: p.provinceName,
      city_name: p.scope === "city" ? p.cityName : null,
      amount: amt,
      active: true,
      priority: 100,
    });

    setAmountText("");
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">新增 / 写入（upsert）</div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-700">范围</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="da-scope"
              checked={p.scope === "province"}
              disabled={!canSelect}
              onChange={() => {
                p.setScope("province");
                if (p.cityCode) p.setCityCode("");
              }}
            />
            省
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="da-scope" checked={p.scope === "city"} disabled={!canSelect} onChange={() => p.setScope("city")} />
            市
          </label>
        </div>

        <div>
          <div className="text-sm text-slate-700">省份 *</div>
          <select
            className="mt-1 w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={p.provinceCode}
            disabled={!canSelect}
            onChange={(e) => {
              const next = e.target.value;
              p.setProvinceCode(next);
              if (p.cityCode) p.setCityCode("");
            }}
          >
            <option value="">{p.geoLoading ? "加载中…" : "请选择省份（code）"}</option>
            {p.provinces.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}（{x.code}）
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-sm text-slate-700">城市 {p.scope === "city" ? "*" : ""}</div>
          <select
            className="mt-1 w-[240px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={p.cityCode}
            disabled={cityDisabled}
            onChange={(e) => p.setCityCode(e.target.value)}
          >
            <option value="">
              {p.scope !== "city" ? "省模式不需要" : !p.provinceCode ? "请先选择省份" : p.geoLoading ? "加载中…" : "请选择城市（code）"}
            </option>
            {p.cities.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}（{x.code}）
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-sm text-slate-700">金额（元）*</div>
          <input
            className="mt-1 w-[140px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
            value={amountText}
            disabled={p.disabled || p.busy}
            onChange={(e) => setAmountText(e.target.value)}
            placeholder="如：5"
          />
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={p.disabled || p.busy}
          onClick={() => void submit()}
          title="写入后端事实行（同 key 幂等 upsert）"
        >
          写入
        </button>
      </div>
    </div>
  );
};

export default DestAdjustmentsUpsertCard;
