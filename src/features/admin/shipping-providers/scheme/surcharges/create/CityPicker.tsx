// src/features/admin/shipping-providers/scheme/surcharges/create/CityPicker.tsx

import React, { useMemo, useState } from "react";
import { UI } from "../../ui";
import { PROVINCE_CITIES } from "../data/provinceCities";

function toggle(list: string[], v: string): string[] {
  const has = list.includes(v);
  if (has) return list.filter((x) => x !== v);
  return [...list, v];
}

function includesQuery(text: string, q: string): boolean {
  const s = q.trim();
  if (!s) return true;
  return text.includes(s);
}

export const CityPicker: React.FC<{
  selectedProvinces: string[];
  onChangeSelectedProvinces: (next: string[]) => void;

  selectedCities: string[];
  onChangeSelectedCities: (next: string[]) => void;

  disabled?: boolean;
  title?: string;
}> = ({
  selectedProvinces,
  onChangeSelectedProvinces,
  selectedCities,
  onChangeSelectedCities,
  disabled,
  title = "选择城市",
}) => {
  const [q, setQ] = useState("");

  const provincesOrdered = useMemo(() => {
    const all = Object.keys(PROVINCE_CITIES);
    const s = q.trim();
    if (!s) return all;

    const hit: string[] = [];
    const rest: string[] = [];

    for (const prov of all) {
      const cities = PROVINCE_CITIES[prov] ?? [];
      const provHit = prov.includes(s);
      const cityHit = cities.some((c) => c.includes(s));
      if (provHit || cityHit) hit.push(prov);
      else rest.push(prov);
    }
    return [...hit, ...rest];
  }, [q]);

  const selectedCityCount = selectedCities.length;
  const selectedProvCount = selectedProvinces.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={UI.regionTitle}>{title}</div>
        </div>
        <div className={UI.regionMeta}>
          已选省：<span className="font-mono">{selectedProvCount}</span> · 已选城：<span className="font-mono">{selectedCityCount}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          className={UI.regionSearchInput}
          placeholder="搜索省/城市"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="mt-4 space-y-3">
        {provincesOrdered.map((prov) => {
          const provChecked = selectedProvinces.includes(prov);
          const cities = PROVINCE_CITIES[prov] ?? [];

          const provOrCityHit = includesQuery(prov, q) || cities.some((c) => includesQuery(c, q));
          if (!provOrCityHit) return null;

          const provRowClass = provChecked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white";

          return (
            <div key={prov} className={`rounded-2xl border p-4 ${provRowClass}`}>
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={provChecked}
                    disabled={disabled}
                    onChange={() => onChangeSelectedProvinces(toggle(selectedProvinces, prov))}
                  />
                  <span className="text-base font-semibold text-slate-900">{prov}</span>
                  <span className="text-sm text-slate-500">（{cities.length}）</span>
                </label>
              </div>

              {provChecked ? (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                  {cities.map((city) => {
                    const checked = selectedCities.includes(city);
                    const hit = q.trim() ? city.includes(q.trim()) || prov.includes(q.trim()) : false;

                    const boxClass = checked
                      ? hit
                        ? "border-emerald-400 bg-emerald-100"
                        : "border-emerald-300 bg-emerald-50"
                      : hit
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white";

                    return (
                      <label
                        key={city}
                        className={`${UI.regionItemBox} ${boxClass} ${disabled ? "opacity-70" : "hover:bg-slate-50"}`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => onChangeSelectedCities(toggle(selectedCities, city))}
                        />
                        <span className={hit ? UI.regionItemTextHit : UI.regionItemText}>{city}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
