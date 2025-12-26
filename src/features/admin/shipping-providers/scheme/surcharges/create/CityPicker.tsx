// src/features/admin/shipping-providers/scheme/surcharges/create/CityPicker.tsx
//
// 城市勾选器（本期：各省首府 + 深圳）
// - 城市必须从系统白名单勾选，不允许手写
// - 城市按省分组展示，避免歧义
// - 支持搜索（高亮/过滤）

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
  hint?: string;
}> = ({
  selectedProvinces,
  onChangeSelectedProvinces,
  selectedCities,
  onChangeSelectedCities,
  disabled,
  title = "选择城市（按省展开）",
  hint = "本期仅提供：各省首府城市 + 深圳。城市必须从列表勾选。",
}) => {
  const [q, setQ] = useState("");

  const provincesOrdered = useMemo(() => {
    // 只显示已有数据的省（按固定 key 顺序：用 Object.keys 的插入顺序）
    const all = Object.keys(PROVINCE_CITIES);
    const s = q.trim();
    if (!s) return all;

    // 命中置顶：省名命中 or 任一城市命中
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
    <div className={UI.cardTight}>
      <div className={UI.cityPickerHeaderRow}>
        <div>
          <div className={UI.regionTitle}>{title}</div>
          <div className={`mt-1 ${UI.regionHint}`}>{hint}</div>
        </div>

        <div className={UI.regionMeta}>
          已选省：<span className="font-mono">{selectedProvCount}</span> · 已选城：<span className="font-mono">{selectedCityCount}</span>
        </div>
      </div>

      <div className={UI.cityPickerToolbar}>
        <input
          className={UI.regionSearchInput}
          placeholder="搜索省/城市（匹配项置顶）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
        />

        <div className={UI.cityPickerToolbarHint}>操作：先勾省（展开）→ 再勾城市</div>
      </div>

      <div className={UI.cityPickerProvList}>
        {provincesOrdered.map((prov) => {
          const provChecked = selectedProvinces.includes(prov);
          const cities = PROVINCE_CITIES[prov] ?? [];

          // 搜索过滤：若省/城市都不命中，则隐藏
          const provOrCityHit = includesQuery(prov, q) || cities.some((c) => includesQuery(c, q));
          if (!provOrCityHit) return null;

          const provCardCls = `${UI.cityPickerProvCardBase} ${
            provChecked ? UI.cityPickerProvCardOn : UI.cityPickerProvCardOff
          }`;

          return (
            <div key={prov} className={provCardCls}>
              <div className={UI.cityPickerProvHeadRow}>
                <label className={UI.cityPickerProvLabel}>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={provChecked}
                    disabled={disabled}
                    onChange={() => onChangeSelectedProvinces(toggle(selectedProvinces, prov))}
                  />
                  <span className={UI.cityPickerProvName}>{prov}</span>
                  <span className={UI.cityPickerProvCount}>（{cities.length} 城市）</span>
                </label>

                <span className={provChecked ? UI.cityPickerProvStatusOn : UI.cityPickerProvStatusOff}>
                  {provChecked ? "已展开" : "勾选省后可选城市"}
                </span>
              </div>

              {provChecked ? (
                <div className={UI.cityPickerCityGrid}>
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

                    const hoverClass = disabled ? UI.regionItemDisabledOpacity : UI.cityPickerCityHover;

                    return (
                      <label key={city} className={`${UI.regionItemBox} ${boxClass} ${hoverClass}`}>
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

export default CityPicker;
