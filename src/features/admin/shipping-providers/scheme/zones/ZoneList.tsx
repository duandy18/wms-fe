// src/features/admin/shipping-providers/scheme/zones/ZoneList.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import { ZoneRow } from "./ZoneRow";
import { UI } from "../ui";
import {
  fetchSegmentTemplateDetailLite,
  type SegmentTemplateDetailLite,
  type SegmentTemplateItemLite,
} from "./segmentTemplatesApi";

function fmt2(v: string): string {
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function fmtRange(min: string, max: string | null): string {
  const mn = fmt2(min);
  const mx = max ? fmt2(max) : "";
  if (!mx) return `≥ ${mn}kg`;
  return `${mn}–${mx}kg`;
}

function summarizeTemplate(detail: SegmentTemplateDetailLite | null): string {
  if (!detail) return "—";
  const items = (detail.items ?? [])
    .slice()
    .sort((a: SegmentTemplateItemLite, b: SegmentTemplateItemLite) => (a.ord ?? 0) - (b.ord ?? 0))
    .filter((x: SegmentTemplateItemLite) => x.active !== false);

  const ranges = items.map((it: SegmentTemplateItemLite) => fmtRange(it.min_kg, it.max_kg));
  if (ranges.length === 0) return "—";

  const cut = ranges.length > 10 ? [...ranges.slice(0, 10), "…"] : ranges;
  return cut.join(" · ");
}

export const ZoneList: React.FC<{
  zones: PricingSchemeZone[];
  selectedZoneId: number | null;
  disabled?: boolean;
  onSelectZone: (zoneId: number) => void;
  onToggleZone: (z: PricingSchemeZone) => Promise<void>;
  onEditZone: (zoneId: number) => void;
}> = ({ zones, selectedZoneId, disabled, onSelectZone, onToggleZone, onEditZone }) => {
  // ✅ hooks 必须在组件的顶层无条件调用
  const sorted = useMemo(() => {
    const arr = [...(zones ?? [])];
    arr.sort((a, b) => {
      const aa = a.active ? 1 : 0;
      const bb = b.active ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return b.id - a.id;
    });
    return arr;
  }, [zones]);

  const needIds = useMemo(() => {
    const s = new Set<number>();
    for (const z of sorted) {
      const tid = z.segment_template_id;
      if (typeof tid === "number" && Number.isFinite(tid)) s.add(tid);
    }
    return Array.from(s.values()).sort((a, b) => a - b);
  }, [sorted]);

  const [detailById, setDetailById] = useState<Record<number, SegmentTemplateDetailLite | null>>({});
  const [loadingById, setLoadingById] = useState<Record<number, boolean>>({});
  const [errById, setErrById] = useState<Record<number, string | null>>({});

  useEffect(() => {
    let alive = true;

    const commit = (fn: () => void) => {
      if (!alive) return;
      fn();
    };

    (async () => {
      for (const id of needIds) {
        if (detailById[id]) continue;
        if (loadingById[id]) continue;

        commit(() => {
          setLoadingById((prev) => ({ ...prev, [id]: true }));
          setErrById((prev) => ({ ...prev, [id]: null }));
        });

        try {
          const d = await fetchSegmentTemplateDetailLite(id);
          commit(() => setDetailById((prev) => ({ ...prev, [id]: d })));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "加载模板详情失败";
          commit(() => {
            setErrById((prev) => ({ ...prev, [id]: msg }));
            setDetailById((prev) => ({ ...prev, [id]: null }));
          });
        }

        commit(() => setLoadingById((prev) => ({ ...prev, [id]: false })));
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needIds.join("|")]);

  // ✅ 空态放在 hooks 之后，避免 rules-of-hooks
  if (!sorted.length) {
    return <div className={UI.zoneListEmpty}>暂无区域分类，请先创建一条。</div>;
  }

  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className={UI.zoneTableHeadWrap}>
        {/* 不再复用 UI.zoneTableHeadRow（它是 12 列），这里需要 16 列 */}
        <div className="grid grid-cols-16 items-center gap-2 text-sm font-semibold text-slate-700">
          <div className="col-span-1 text-center">序号</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-4">区域</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">重量段方案</div>
          <div className="col-span-3">段结构</div>
          <div className="col-span-2 text-right">操作</div>
        </div>
      </div>

      {sorted.map((z, idx) => {
        const tid = z.segment_template_id;
        const hasTid = typeof tid === "number" && Number.isFinite(tid);

        const d = hasTid ? detailById[tid] ?? null : null;
        const loading = hasTid ? (loadingById[tid] ?? false) : false;
        const err = hasTid ? (errById[tid] ?? null) : null;

        const templateName = !hasTid ? "—" : loading ? "加载中…" : err ? `模板#${tid}` : d?.name ?? `模板#${tid}`;

        const templateSummary = !hasTid ? "—" : loading ? "加载中…" : err ? "详情加载失败" : summarizeTemplate(d);

        return (
          <ZoneRow
            key={z.id}
            index={idx + 1}
            zone={z}
            selected={selectedZoneId === z.id}
            disabled={disabled}
            onSelect={onSelectZone}
            onEdit={onEditZone}
            onToggleActive={onToggleZone}
            templateName={templateName}
            templateSummary={templateSummary}
          />
        );
      })}
    </div>
  );
};
