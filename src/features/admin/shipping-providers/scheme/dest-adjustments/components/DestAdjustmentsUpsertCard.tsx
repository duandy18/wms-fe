// src/features/admin/shipping-providers/scheme/dest-adjustments/components/DestAdjustmentsUpsertCard.tsx
import React, { useMemo } from "react";
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

  editing: boolean;
  onCancelEdit: () => void;

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

  amountText: string;
  setAmountText: (v: string) => void;

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

    const amt = toNum(p.amountText);
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
      // ✅ 保存 ≠ 启用：新建默认不启用（启用必须由列表行显式触发）
      active: false,
      priority: 100,
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">{p.editing ? "编辑附加费" : "新建附加费"}</div>
        {p.editing ? (
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={p.disabled || p.busy}
            onClick={() => p.onCancelEdit()}
            title="退出编辑并清空表单"
          >
            取消编辑
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-700">范围</label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="da-scope"
              checked={p.scope === "province"}
              disabled={!canSelect || p.editing}
              onChange={() => {
                p.setScope("province");
                if (p.cityCode) p.setCityCode("");
              }}
            />
            省
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="da-scope"
              checked={p.scope === "city"}
              disabled={!canSelect || p.editing}
              onChange={() => p.setScope("city")}
            />
            市
          </label>
        </div>

        <div>
          <div className="text-sm text-slate-700">省份 *</div>
          <select
            className="mt-1 w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={p.provinceCode}
            disabled={!canSelect || p.editing}
            onChange={(e) => {
              const next = e.target.value;
              p.setProvinceCode(next);
              if (p.cityCode) p.setCityCode("");
            }}
          >
            <option value="">{p.geoLoading ? "加载中…" : "请选择省份"}</option>
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
            disabled={cityDisabled || p.editing}
            onChange={(e) => p.setCityCode(e.target.value)}
          >
            <option value="">
              {p.scope !== "city" ? "省模式不需要" : !p.provinceCode ? "请先选择省份" : p.geoLoading ? "加载中…" : "请选择城市"}
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
            value={p.amountText}
            disabled={p.disabled || p.busy}
            onChange={(e) => p.setAmountText(e.target.value)}
            placeholder="如：5"
          />
        </div>

        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          disabled={p.disabled || p.busy}
          onClick={() => void submit()}
          title={p.editing ? "保存修改（不改变启用状态）" : "新建并保存（默认不启用）"}
        >
          {p.editing ? "保存修改" : "新建附加费"}
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-500">提示：保存不等于启用；是否参与算价请在下方列表中手动启用/停用。</div>
    </div>
  );
};

export default DestAdjustmentsUpsertCard;
