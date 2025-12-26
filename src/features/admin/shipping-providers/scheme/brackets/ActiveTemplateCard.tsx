// src/features/admin/shipping-providers/scheme/brackets/ActiveTemplateCard.tsx
//
// 当前生效方案（只读 + 段级启用/暂停）
// 使用者视角：这里展示“线上正在用什么方案”

import React, { useMemo } from "react";
import type { SegmentTemplateOut, SegmentTemplateItemOut } from "../../api/types";
import UI from "../ui";

function displayName(name: string): string {
  return String(name ?? "")
    .replace(/表头模板/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fmt2(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string | null): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `w ≥ ${mn} kg`;
  return `${mn} ≤ w < ${mx} kg`;
}

export const ActiveTemplateCard: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;
  onToggleItem: (item: SegmentTemplateItemOut) => void;
}> = ({ template, disabled, onToggleItem }) => {
  const items = useMemo(() => {
    const arr = template?.items?.slice() ?? [];
    arr.sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
    return arr;
  }, [template]);

  return (
    <div className={UI.cardSoft}>
      <div className={UI.sectionTitle}>当前生效方案</div>

      {!template ? (
        <div className="mt-3 text-base text-slate-600">当前没有生效方案。</div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-base text-slate-800">
              <span className="text-slate-500">方案：</span>
              <span className="font-semibold">{displayName(template.name)}</span>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-base font-semibold text-slate-700">
                  <th className="px-3 py-2 w-[240px]">重量段（kg）</th>
                  <th className="px-3 py-2 w-[120px]">使用状态</th>
                  <th className="px-3 py-2 w-[160px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 text-base">
                    <td className="px-3 py-2 font-mono text-slate-800">{fmtRange(it.min_kg, it.max_kg)}</td>
                    <td className="px-3 py-2">
                      <span className={it.active ? UI.statusOn : UI.statusOff}>{it.active ? "启用" : "已暂停"}</span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className={it.active ? UI.btnDangerSm : UI.btnNeutralSm}
                        disabled={disabled}
                        onClick={() => onToggleItem(it)}
                        title={it.active ? "暂停该重量段（录价页不再使用）" : "启用该重量段（录价页恢复使用）"}
                      >
                        {it.active ? "暂停" : "启用"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveTemplateCard;
