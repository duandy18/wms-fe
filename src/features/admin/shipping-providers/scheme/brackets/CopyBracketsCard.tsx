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

  // Source 固定：当前选中 Zone
  const sourceZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const [conflictPolicy, setConflictPolicy] = useState<"skip" | "overwrite">("skip");

  // Target：可多选（更符合“复制到其他区域”的效率目标）
  const [targetZoneIds, setTargetZoneIds] = useState<number[]>([]);

  const targetOptions = useMemo(() => {
    // target 下拉：同 scheme 内，排除 source；优先 active zones（selectableZones）
    const list = selectableZones.length ? selectableZones : zones;
    return list.filter((z) => (selectedZoneId ? z.id !== selectedZoneId : true));
  }, [selectableZones, zones, selectedZoneId]);

  useEffect(() => {
    // 当 source 变化时：若当前 target 为空或已失效，则默认勾选第一个可用 target
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
      alert("请先选择一个已录好报价的 Zone 作为来源（Source）");
      return;
    }
    if (!targetZoneIds.length) {
      alert("请选择至少一个目标 Zone（Target）");
      return;
    }

    onBusy(true);
    try {
      // 逐个复制：不改后端接口、不引入新批量 API
      // 统计汇总：把每次返回 summary 做累加，便于一眼看懂结果
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
          // UI 隐藏，但行为固定为“更少惊喜”的默认值：
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
        `复制完成（Source: ${sourceZone.name} #${sourceZone.id}）`,
        `targets=${targetZoneIds.length}`,
        `created=${agg.created}`,
        `updated=${agg.updated}`,
        `skipped=${agg.skipped}`,
        `failed=${agg.failed}`,
      ].join(" · ");
      alert(msg);

      // ✅ 复制后刷新 scheme detail（只刷新 brackets/drafts 的本地显示，不依赖父级刷新）
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
      <div className="text-sm font-semibold text-slate-900">复制当前 Zone 报价到其他 Zone</div>
      <div className="mt-1 text-xs text-slate-600">
        用途：先把一个 Zone 的重量段报价录好，然后一键复制到其他区域；复制后如有少量差异，再去目标 Zone 微调。
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">Source（当前选中 Zone，已录好报价的一套）</label>
          <div className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800">
            {sourceZone ? `${sourceZone.name} (#${sourceZone.id})` : "—（请先选择一个 Zone）"}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">Target（要复制到的 Zone，可多选）</label>
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
          <div className="mt-1 text-xs text-slate-500">提示：按住 Ctrl/⌘ 可多选；Shift 可连续多选。</div>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-600">冲突策略</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            value={conflictPolicy}
            disabled={busy}
            onChange={(e) => setConflictPolicy(e.target.value as "skip" | "overwrite")}
          >
            <option value="skip">skip（目标已存在就跳过）</option>
            <option value="overwrite">overwrite（覆盖目标已有）</option>
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
