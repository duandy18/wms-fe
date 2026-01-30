// src/features/admin/shipping-providers/scheme/table/cards/zoneCard/BindingOverviewTable.tsx

import React, { useMemo, useState } from "react";
import type { SegmentTemplateDetailLite } from "../../../zones/segmentTemplatesApi";
import { rangesSummary, toRanges } from "./templateFmt";

type ZoneLike = {
  id: number;
  name?: string | null;
  active?: boolean | null;
  segment_template_id?: number | null;
};

export const BindingOverviewTable: React.FC<{
  zones: ZoneLike[];
  selectedZoneId: number | null;

  templateNameById: Map<number, string>;

  detailById: Record<number, SegmentTemplateDetailLite | null>;
  loadingById: Record<number, boolean>;
  errById: Record<number, string | null>;

  // ✅ 解除绑定：zone.segment_template_id -> null
  onUnbindZone: (zoneId: number) => void | Promise<void>;
}> = ({ zones, selectedZoneId, templateNameById, detailById, loadingById, errById, onUnbindZone }) => {
  const zonesActiveOnly = useMemo(() => zones.filter((z) => Boolean(z.active)), [zones]);
  const [pendingUnbindZoneId, setPendingUnbindZoneId] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      {/* 仅保留标题，不再展示解释性文案 */}
      <div className="text-sm font-semibold text-slate-900">区域绑定概览</div>

      <div className="mt-3 overflow-auto rounded-lg border border-slate-200">
        <table className="min-w-[960px] w-full text-sm table-fixed">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-700">
              {/* Zone 占 1/2 */}
              <th className="px-3 py-2 w-1/2">区域（Zone）</th>
              <th className="px-3 py-2 w-1/6">绑定模板</th>
              <th className="px-3 py-2 w-1/6">重量段结构描述</th>
              <th className="px-3 py-2 w-1/6">状态</th>
              <th className="px-3 py-2 w-[140px]">操作</th>
            </tr>
          </thead>

          <tbody>
            {zonesActiveOnly.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-slate-500">
                  当前没有可用 Zone。
                </td>
              </tr>
            ) : (
              zonesActiveOnly.map((z) => {
                const zid = z.id;
                const zname = String(z.name ?? "").trim() || `Zone#${zid}`;
                const tid = z.segment_template_id ?? null;

                const bound = typeof tid === "number" && Number.isFinite(tid) && tid > 0;
                const tplName = bound ? templateNameById.get(tid) ?? `模板#${tid}` : "—";

                const d = bound ? detailById[tid] ?? null : null;
                const loading = bound ? (loadingById[tid] ?? false) : false;
                const err = bound ? (errById[tid] ?? null) : null;

                const ranges = d ? toRanges(d) : [];
                const desc = !bound
                  ? "—"
                  : loading
                    ? "结构加载中…"
                    : err
                      ? `结构加载失败：${err}`
                      : rangesSummary(ranges);

                return (
                  <tr key={zid} className={selectedZoneId === zid ? "bg-blue-50" : ""}>
                    {/* ✅ 已绑定 Zone 名称用绿色字体强调 */}
                    <td className="px-3 py-2 border-t border-slate-200 align-top">
                      <div
                        className={[
                          "font-semibold whitespace-normal break-words",
                          bound ? "text-emerald-700" : "text-slate-900",
                        ].join(" ")}
                      >
                        {zname}
                      </div>
                      <div className="text-xs text-slate-500">
                        zone_id=<span className="font-mono">{zid}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 border-t border-slate-200 align-top">
                      {bound ? (
                        <div className="whitespace-normal break-words">
                          <div className="text-slate-900">{tplName}</div>
                          <div className="text-xs text-slate-500">
                            template_id=<span className="font-mono">{tid}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">未绑定</span>
                      )}
                    </td>

                    <td className="px-3 py-2 border-t border-slate-200 align-top">
                      <span className={desc.startsWith("结构加载失败") ? "text-rose-700" : "text-slate-700"}>{desc}</span>
                    </td>

                    <td className="px-3 py-2 border-t border-slate-200 align-top">
                      {bound ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          已绑定
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                          未绑定
                        </span>
                      )}
                    </td>

                    {/* ✅ 操作：解除绑定（行内确认） */}
                    <td className="px-3 py-2 border-t border-slate-200 align-top">
                      {!bound ? (
                        <span className="text-slate-400">—</span>
                      ) : pendingUnbindZoneId === zid ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-slate-200 bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                            onClick={async () => {
                              try {
                                await onUnbindZone(zid);
                              } finally {
                                setPendingUnbindZoneId(null);
                              }
                            }}
                            title="确认解除绑定：该区域将变为未绑定，需重新绑定模板后才能录价/算价"
                          >
                            确认解除
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            onClick={() => setPendingUnbindZoneId(null)}
                            title="取消"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          onClick={() => setPendingUnbindZoneId(zid)}
                          title="解除绑定：若该区域已录价（有 brackets），后端将阻断解绑，请先清空报价明细后再解绑。"
                        >
                          解除绑定
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BindingOverviewTable;
