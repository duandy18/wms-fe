// src/features/admin/shipping-providers/scheme/brackets/ActiveTemplateCard.tsx
//
// 当前生效方案（纯只读锚点）
// - 不呈现段级启停入口
// - 只做展示：更紧凑的表格密度、更清晰的层级

import React, { useMemo } from "react";
import type { SegmentTemplateOut, SegmentTemplateItemOut } from "./segmentTemplates";
import { UI } from "../ui";

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
  if (!mx) return `w ≥ ${mn}`;
  return `${mn} ≤ w < ${mx}`;
}

export const ActiveTemplateCard: React.FC<{
  template: SegmentTemplateOut | null;
  disabled: boolean;
}> = ({ template }) => {
  const items = useMemo(() => {
    const arr = (template?.items ?? []).slice();
    arr.sort((a: SegmentTemplateItemOut, b: SegmentTemplateItemOut) => (a.ord ?? 0) - (b.ord ?? 0));
    return arr.filter((it) => it.active !== false);
  }, [template]);

  return (
    <div className={UI.cardSoft}>
      <div className={`${UI.sectionTitle} text-[15px] font-semibold`}>当前生效方案</div>

      {!template ? (
        <div className="mt-3 text-sm text-slate-600">当前没有生效方案。</div>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-800">
              <span className="text-slate-500">方案：</span>
              <span className="font-semibold">{displayName(template.name ?? "")}</span>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            {items.length === 0 ? (
              <div className="text-sm text-slate-600">该方案没有段数据。</div>
            ) : (
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-600">
                    <th className="px-2.5 py-2 w-[360px]">
                      重量段 <span className="font-normal text-slate-500">（kg）</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it: SegmentTemplateItemOut) => (
                    <tr key={it.id} className="border-b border-slate-100 text-sm">
                      <td className="px-2.5 py-[6px] font-mono text-slate-800">
                        {fmtRange(it.min_kg, it.max_kg)} <span className="text-slate-400">kg</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveTemplateCard;
