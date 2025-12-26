// src/features/admin/shipping-providers/scheme/brackets/ActiveTemplateCard.tsx
//
// 当前生效的重量段文件（只读 + 段级启用/暂停）
// 使用者视角：这里展示“线上正在用什么文件”，不暴露 debug 字段

import React, { useMemo } from "react";
import type { SegmentTemplateOut, SegmentTemplateItemOut } from "../../api/types";
import UI from "../ui";

function fmt2(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string | null): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `w ≥ ${mn}`;
  return `${mn} ≤ w < ${mx}`;
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
      <div className={UI.sectionTitle}>当前生效的重量段文件</div>
      <div className={UI.panelHint}>
        该文件正在用于录价/算价。你可以暂停某一段（不会改变重量段结构，只影响是否使用）。
      </div>

      {!template ? (
        <div className="mt-3 text-sm text-slate-600">当前没有生效文件（请新建并应用一套重量段文件）。</div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-800">
              <span className="text-slate-500">文件：</span>
              <span className="font-semibold">{template.name}</span>
              <span className="ml-2 text-xs text-slate-500">（当前生效）</span>
            </div>
            <div className="text-xs text-slate-500">生效时间：{template.published_at ?? "—"}</div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                  <th className="px-3 py-2 w-[240px]">重量段</th>
                  <th className="px-3 py-2 w-[120px]">使用状态</th>
                  <th className="px-3 py-2 w-[160px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 text-sm">
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

            <div className="mt-2 text-xs text-slate-500">
              说明：如需调整重量段结构，请新建一个“重量段文件”，保存草稿后在下拉框里选择并点击“应用此文件”。
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveTemplateCard;
