// src/features/admin/shipping-providers/scheme/brackets/ActiveTemplateCard.tsx
//
// 已生效模板（纯只读锚点，可多条）
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

function sortedActiveItems(template: SegmentTemplateOut): SegmentTemplateItemOut[] {
  const arr = (template.items ?? []).slice();
  arr.sort((a: SegmentTemplateItemOut, b: SegmentTemplateItemOut) => (a.ord ?? 0) - (b.ord ?? 0));
  return arr.filter((it) => it.active !== false);
}

export const ActiveTemplateCard: React.FC<{
  templates: SegmentTemplateOut[];
  disabled: boolean;
}> = ({ templates }) => {
  const list = useMemo(() => {
    const arr = (templates ?? []).slice();
    // 稳定排序：优先按 id（你也可以后续换成 updated_at / activated_at）
    arr.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    return arr;
  }, [templates]);

  return (
    <div className={UI.cardSoft}>
      <div className={`${UI.sectionTitle} text-[15px] font-semibold`}>
        已生效模板 <span className="text-slate-500 font-normal">（{list.length} 条）</span>
      </div>

      {list.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600">当前没有已生效模板。</div>
      ) : (
        <div className="mt-3 space-y-3">
          {list.map((t) => {
            const items = sortedActiveItems(t);
            return (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-slate-800">
                    <span className="text-slate-500">模板：</span>
                    <span className="font-semibold">{displayName(t.name ?? "")}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      ID: <span className="font-mono">{t.id}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 overflow-x-auto">
                  {items.length === 0 ? (
                    <div className="text-sm text-slate-600">该模板没有段数据。</div>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveTemplateCard;
