// src/features/admin/shipping-providers/scheme/brackets/CopyBracketsCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeZone } from "../../api";
import { copyZoneBrackets, fetchPricingSchemeDetail } from "../../api";
import { PUI } from "./ui";

type CopyConflictPolicy = "skip" | "overwrite";

function conflictLabel(v: CopyConflictPolicy): string {
  if (v === "skip") return "遇到已存在则跳过（更安全）";
  return "覆盖目标已有报价（更强制）";
}

function buildSummaryLine(args: {
  sourceName: string;
  targetsCount: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}): string {
  const { sourceName, targetsCount, created, updated, skipped, failed } = args;
  return `复制完成：来源「${sourceName}」→ 目标 ${targetsCount} 个 · 新增 ${created} · 覆盖 ${updated} · 跳过 ${skipped} · 失败 ${failed}`;
}

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

  // 来源：当前选中区域分类
  const sourceZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const [conflictPolicy, setConflictPolicy] = useState<CopyConflictPolicy>("skip");

  // 目标：可多选
  const [targetZoneIds, setTargetZoneIds] = useState<number[]>([]);

  // 结果提示（页内，不弹窗）
  const [notice, setNotice] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const targetOptions = useMemo(() => {
    // 目标列表：同方案内，排除来源；优先 active zones（selectableZones）
    const list = selectableZones.length ? selectableZones : zones;
    return list.filter((z) => (selectedZoneId ? z.id !== selectedZoneId : true));
  }, [selectableZones, zones, selectedZoneId]);

  useEffect(() => {
    // 来源变化时：清理提示
    setNotice("");
    setErrorText("");

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
    setNotice("");
    setErrorText("");

    if (!selectedZoneId || !sourceZone) {
      setErrorText("请先在上方“主流程”里选择一个已录好报价的区域分类，作为复制来源。");
      return;
    }
    if (!targetZoneIds.length) {
      setErrorText("请选择至少一个目标区域分类。");
      return;
    }

    onBusy(true);
    try {
      const agg = { created: 0, updated: 0, skipped: 0, failed: 0 };

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

      setNotice(
        buildSummaryLine({
          sourceName: sourceZone.name,
          targetsCount: targetZoneIds.length,
          created: agg.created,
          updated: agg.updated,
          skipped: agg.skipped,
          failed: agg.failed,
        }),
      );

      // ✅ 复制后刷新 scheme detail（只刷新 brackets/drafts 的本地显示，不依赖父级刷新）
      const fresh = await fetchPricingSchemeDetail(schemeId);
      onAfterRefreshBrackets(fresh.zones ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "复制失败";
      setErrorText(msg);
    } finally {
      onBusy(false);
    }
  }

  const canCopy = !!selectedZoneId && !!sourceZone && targetZoneIds.length > 0;
  const disabled = busy || !canCopy;

  return (
    <div className={PUI.cardSoft}>
      <div className={PUI.title}>复制区域报价</div>
      <div className={PUI.hint}>
        用途：先录好一个区域分类的报价，再一键复制到其他区域；复制后如有少量差异，再去目标区域微调。
      </div>

      {errorText ? <div className={PUI.warnBox}>{errorText}</div> : null}
      {notice ? <div className={PUI.infoBox}>{notice}</div> : null}

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="md:col-span-3">
          <label className={PUI.formLabel}>来源区域分类（当前选中）</label>
          <div className={`${PUI.formSelectMono} mt-1 border border-slate-200 bg-white`}>
            {sourceZone ? sourceZone.name : "—（请先在上方选择一个区域分类）"}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className={PUI.formLabel}>目标区域分类（可多选）</label>
          <select
            className={PUI.formSelect}
            multiple
            size={Math.min(6, Math.max(3, targetOptions.length || 3))}
            value={targetZoneIds.map(String)}
            disabled={busy || !selectedZoneId}
            onChange={onChangeTargets}
          >
            {targetOptions.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <div className={PUI.hint}>提示：按住 Ctrl/⌘ 可多选；Shift 可连续多选。</div>
        </div>

        <div className="md:col-span-3">
          <label className={PUI.formLabel}>冲突策略</label>
          <select
            className={PUI.formSelect}
            value={conflictPolicy}
            disabled={busy}
            onChange={(e) => setConflictPolicy(e.target.value as CopyConflictPolicy)}
          >
            <option value="skip">{conflictLabel("skip")}</option>
            <option value="overwrite">{conflictLabel("overwrite")}</option>
          </select>
        </div>

        <div className="flex items-end justify-end md:col-span-3">
          <button
            type="button"
            className={disabled ? PUI.primaryBtnDisabled : PUI.primaryBtn}
            disabled={disabled}
            onClick={() => void handleCopy()}
            title={!selectedZoneId ? "请先选择来源区域分类" : !targetZoneIds.length ? "请选择至少一个目标区域" : "开始复制"}
          >
            {busy ? "复制中…" : "一键复制"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CopyBracketsCard;
