// src/features/admin/shipping-providers/scheme/brackets/CopyBracketsCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import { copyZoneBrackets, fetchPricingSchemeDetail } from "../../api";

export function CopyBracketsCard(props: {
  schemeId: number;
  zones: PricingSchemeZone[];
  selectableZones: PricingSchemeZone[];
  selectedZoneId: number | null;
  busy: boolean;
  onBusy: (v: boolean) => void;
  onAfterRefreshBrackets: (freshZones: PricingSchemeZone[]) => void;
}) {
  const { schemeId, zones, selectableZones, selectedZoneId, busy, onBusy, onAfterRefreshBrackets } = props;

  // 来源：当前选中区域
  const sourceZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const [conflictPolicy, setConflictPolicy] = useState<"skip" | "overwrite">("skip");

  // 目标：可多选
  const [targetZoneIds, setTargetZoneIds] = useState<number[]>([]);

  const targetOptions = useMemo(() => {
    const list = selectableZones.length ? selectableZones : zones;
    return list.filter((z) => (selectedZoneId ? z.id !== selectedZoneId : true));
  }, [selectableZones, zones, selectedZoneId]);

  useEffect(() => {
    if (!selectedZoneId) {
      setTargetZoneIds([]);
      return;
    }
    const valid = new Set(targetOptions.map((z) => z.id));
    const kept = targetZoneIds.filter((id) => valid.has(id));

    if (kept.length > 0) {
      if (kept.length !== targetZoneIds.length) setTargetZoneIds(kept);
      return;
    }

    const first = targetOptions[0];
    setTargetZoneIds(first ? [first.id] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZoneId, targetOptions]);

  function onChangeTargets(e: React.ChangeEvent<HTMLSelectElement>) {
    const ids = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
    setTargetZoneIds(ids.filter((n) => Number.isFinite(n)));
  }

  async function handleCopy() {
    if (!selectedZoneId || !sourceZone) {
      alert("请先选择来源区域");
      return;
    }
    if (!targetZoneIds.length) {
      alert("请选择至少一个目标区域");
      return;
    }

    onBusy(true);
    try {
      const agg = {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      };

      for (const targetId of targetZoneIds) {
        const res = await copyZoneBrackets(targetId, {
          source_zone_id: selectedZoneId,
          conflict_policy: conflictPolicy,
          active_policy: "force_active",
          include_inactive: false,
          pricing_modes: undefined,
        });

        const sum = res.summary ?? {};
        agg.created += sum.created_count ?? 0;
        agg.updated += sum.updated_count ?? 0;
        agg.skipped += sum.skipped_count ?? 0;
        agg.failed += sum.failed_count ?? 0;
      }

      const msg = [
        `复制完成`,
        `来源：${sourceZone.name} #${sourceZone.id}`,
        `目标数=${targetZoneIds.length}`,
        `新增=${agg.created}`,
        `覆盖=${agg.updated}`,
        `跳过=${agg.skipped}`,
        `失败=${agg.failed}`,
      ].join(" · ");
      alert(msg);

      const fresh = await fetchPricingSchemeDetail(schemeId);
      onAfterRefreshBrackets(fresh.zones ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "复制失败";
      alert(msg);
    } finally {
      onBusy(false);
    }
  }

  const disabled = busy || !selectedZoneId || !targetZoneIds.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">复制当前区域报价到其他区域</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">来源区域</label>
          <div className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800">
            {sourceZone ? `${sourceZone.name} (#${sourceZone.id})` : "—"}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">目标区域</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            multiple
            size={Math.min(6, Math.max(3, targetOptions.length || 3))}
            value={targetZoneIds.map(String)}
            disabled={busy || !selectedZoneId}
            onChange={onChangeTargets}
          >
            {targetOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} (#{z.id})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">冲突策略</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={conflictPolicy}
            disabled={busy}
            onChange={(e) => setConflictPolicy(e.target.value as "skip" | "overwrite")}
          >
            <option value="skip">跳过已存在</option>
            <option value="overwrite">覆盖已存在</option>
          </select>
        </div>

        <div className="flex items-end justify-end md:col-span-3">
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              disabled ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
            disabled={disabled}
            onClick={() => void handleCopy()}
          >
            {busy ? "复制中…" : "一键复制"}
          </button>
        </div>
      </div>
    </div>
  );
}
