// src/features/admin/shipping-providers/scheme/zones/SegmentTemplateRadioPicker.tsx
import React, { useEffect, useMemo, useState } from "react";
import { UI } from "../ui";
import {
  fetchSegmentTemplateDetailLite,
  type SegmentTemplateDetailLite,
  type SegmentTemplateItemLite,
  type SegmentTemplateLite,
} from "./segmentTemplatesApi";

type Props = {
  disabled: boolean;
  templates: SegmentTemplateLite[];
  value: number | null;
  picked: boolean;
  onChange: (next: { id: number | null; picked: boolean }) => void;
};

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

function toRanges(detail: SegmentTemplateDetailLite): string[] {
  const items = (detail.items ?? [])
    .slice()
    .sort((a: SegmentTemplateItemLite, b: SegmentTemplateItemLite) => (a.ord ?? 0) - (b.ord ?? 0))
    .filter((x: SegmentTemplateItemLite) => x.active !== false);

  return items.map((it: SegmentTemplateItemLite) => fmtRange(it.min_kg, it.max_kg));
}

function PickBox(props: { checked: boolean }) {
  const { checked } = props;
  return (
    <div
      aria-hidden="true"
      className={[
        "h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center",
        checked ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
      ].join(" ")}
    >
      {checked ? <span className="text-white text-sm font-black leading-none">✓</span> : null}
    </div>
  );
}

function Card(props: {
  title: string;
  subtitle?: string;
  checked: boolean;
  disabled: boolean;
  onClick: () => void;
  ranges: string[];
  badgeRight?: React.ReactNode;
}) {
  const { title, subtitle, checked, disabled, onClick, ranges, badgeRight } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-3 text-left",
        checked ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
        disabled ? "opacity-60" : "",
      ].join(" ")}
      title={disabled ? "只读模式" : "点击选择该方案"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
                {badgeRight}
              </div>
              {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
            </div>

            <div className="flex items-center gap-2">
              {checked ? (
                <span className="hidden sm:inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  已选择
                </span>
              ) : null}
              <PickBox checked={checked} />
            </div>
          </div>

          <div className="mt-2 text-xs font-mono text-slate-700">
            {ranges.length === 0 ? <span className="text-slate-500">（无段结构）</span> : ranges.join(" · ")}
          </div>
        </div>
      </div>
    </button>
  );
}

export const SegmentTemplateRadioPicker: React.FC<Props> = ({ disabled, templates, value, picked, onChange }) => {
  const activeTemplates = useMemo(() => templates.filter((t) => t.is_active), [templates]);

  const [detailById, setDetailById] = useState<Record<number, SegmentTemplateDetailLite | null>>({});
  const [loadingById, setLoadingById] = useState<Record<number, boolean>>({});
  const [errById, setErrById] = useState<Record<number, string | null>>({});

  const needIds = useMemo(() => activeTemplates.map((t) => t.id), [activeTemplates]);

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

  return (
    <div className="space-y-2">
      <label className={UI.zoneLabel}>重量段方案（必选）</label>

      <div className="grid grid-cols-1 gap-2">
        {activeTemplates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            当前没有“启用中”的重量段方案。请先到「重量段方案」创建并启用至少一个模板。
          </div>
        ) : (
          activeTemplates.map((t) => {
            const checked = picked && value === t.id;
            const d = detailById[t.id] ?? null;
            const err = errById[t.id] ?? null;
            const loading = loadingById[t.id] ?? false;

            const subtitle =
              loading ? "详情加载中…" : err ? `详情加载失败：${err}` : t.status ? `状态：${t.status}` : "";

            const ranges = d ? toRanges(d) : [];

            return (
              <Card
                key={t.id}
                title={t.name}
                subtitle={subtitle}
                checked={checked}
                disabled={disabled}
                onClick={() => onChange({ id: t.id, picked: true })}
                ranges={ranges}
                badgeRight={
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    已启用
                  </span>
                }
              />
            );
          })
        )}
      </div>

      <div className="mt-1 text-xs text-slate-600">说明：本区域必须显式绑定一个“启用中”的重量段方案，用于后续录价矩阵的行结构。</div>
    </div>
  );
};

export default SegmentTemplateRadioPicker;
