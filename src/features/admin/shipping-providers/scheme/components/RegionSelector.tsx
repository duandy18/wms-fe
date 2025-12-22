// src/features/admin/shipping-providers/scheme/components/RegionSelector.tsx
//
// 省份集合选择器（平铺版）
// - 搜索：高亮 + 置顶（不隐藏未匹配项）
// - 不提供全选 / 清空等批量操作
// - 字号/密度由 scheme/ui.ts 统一控制

import React, { useMemo, useState } from "react";
import { UI } from "../ui";

const CN_PROVINCES: string[] = [
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

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  title?: string;
  hint?: string;
};

function toggle(list: string[], v: string): string[] {
  const has = list.includes(v);
  if (has) return list.filter((x) => x !== v);
  return [...list, v];
}

function includesQuery(text: string, q: string): boolean {
  const s = q.trim();
  if (!s) return false;
  return text.includes(s);
}

export const RegionSelector: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  title = "选择省份",
  hint = "",
}) => {
  const [q, setQ] = useState("");

  // ✅ 搜索策略：不隐藏，只做“命中置顶 + 高亮”
  const ordered = useMemo(() => {
    const s = q.trim();
    if (!s) return CN_PROVINCES;

    const hit: string[] = [];
    const rest: string[] = [];

    for (const p of CN_PROVINCES) {
      if (p.includes(s)) hit.push(p);
      else rest.push(p);
    }

    return [...hit, ...rest];
  }, [q]);

  const selectedCount = value.length;
  const qTrim = q.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={UI.regionTitle}>{title}</div>
          {hint ? <div className={`mt-1 ${UI.regionHint}`}>{hint}</div> : null}
        </div>

        <div className={UI.regionMeta}>
          已选：<span className="font-mono">{selectedCount}</span>
        </div>
      </div>

      <div className="mt-4">
        <input
          className={UI.regionSearchInput}
          placeholder="搜索省份（高亮+置顶，不会隐藏列表）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* 省份平铺列表 */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {ordered.map((p) => {
          const checked = value.includes(p);
          const hit = qTrim ? includesQuery(p, qTrim) : false;

          const boxClass = checked
            ? hit
              ? "border-emerald-400 bg-emerald-100"
              : "border-emerald-300 bg-emerald-50"
            : hit
              ? "border-amber-300 bg-amber-50"
              : "border-slate-200 bg-white";

          const hoverClass = disabled ? "opacity-70" : "hover:bg-slate-50";

          return (
            <label key={p} className={`${UI.regionItemBox} ${boxClass} ${hoverClass}`}>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(toggle(value, p))}
              />

              <span
                className={hit ? UI.regionItemTextHit : UI.regionItemText}
                title={hit ? `匹配：${qTrim}` : undefined}
              >
                {p}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RegionSelector;
