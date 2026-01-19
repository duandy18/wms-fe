// src/features/admin/warehouses/detail/ProvincePickerPanel.tsx
import React, { useMemo } from "react";
import { UI } from "./ui";
import { CN_PROVINCES } from "./provinces";

function toSet(list: string[]): Set<string> {
  const s = new Set<string>();
  for (const x of list || []) {
    const v = (x || "").trim();
    if (v) s.add(v);
  }
  return s;
}

function sortZh(list: string[]): string[] {
  return [...list].sort((a, b) => a.localeCompare(b, "zh"));
}

function segBtnCls(active: boolean): string {
  const base =
    "px-3 py-1.5 text-sm rounded-lg border transition disabled:opacity-60 disabled:cursor-not-allowed";
  if (active) return `${base} bg-slate-900 text-white border-slate-900`;
  return `${base} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`;
}

export const ProvincePickerPanel: React.FC<{
  canWrite: boolean;
  saving: boolean;

  selectedProvinces: string[];
  setSelectedProvinces: (next: string[]) => void;

  ownerByProvince: Record<string, number>;
  warehouseId: number;

  citySplitProvinces: string[];

  onUpgradeProvinceToCitySplit: (province: string) => Promise<void> | void;
  onDowngradeProvinceFromCitySplit: (province: string) => Promise<void> | void;

  onJumpToCities: () => void;
}> = (p) => {
  const selected = useMemo(() => toSet(p.selectedProvinces), [p.selectedProvinces]);
  const splitSet = useMemo(() => toSet(p.citySplitProvinces), [p.citySplitProvinces]);

  function isBlocked(prov: string): { blocked: boolean; label?: string } {
    if (splitSet.has(prov)) return { blocked: true, label: "按城市配置" };

    const owner = p.ownerByProvince[prov];
    if (!owner) return { blocked: false };
    if (owner === p.warehouseId) return { blocked: false };
    return { blocked: true, label: `已属于仓库 ${owner}` };
  }

  function writeSelected(next: Set<string>) {
    p.setSelectedProvinces(sortZh(Array.from(next)));
  }

  function toggleProvince(prov: string) {
    const blk = isBlocked(prov);
    if (blk.blocked) return;

    const next = new Set(selected);
    if (next.has(prov)) next.delete(prov);
    else next.add(prov);
    writeSelected(next);
  }

  function clearAll() {
    p.setSelectedProvinces([]);
  }

  function selectAll() {
    const next = new Set<string>();
    for (const prov of CN_PROVINCES) {
      const blk = isBlocked(prov);
      if (blk.blocked) continue;
      next.add(prov);
    }
    writeSelected(next);
  }

  async function switchToCity(prov: string) {
    const ok = window.confirm(
      `将【${prov}】设为按城市配置？\n\n说明：\n- 该省将不再按省命中\n- 订单将按城市命中\n- 未配置城市将阻断（NO_SERVICE_WAREHOUSE）`,
    );
    if (!ok) return;

    await p.onUpgradeProvinceToCitySplit(prov);
    p.onJumpToCities();
  }

  async function switchToProvince(prov: string) {
    const ok = window.confirm(
      `将【${prov}】设为按省配置？\n\n说明：\n- 该省将恢复按省命中\n- 需要重新勾选并保存后生效`,
    );
    if (!ok) return;

    await p.onDowngradeProvinceFromCitySplit(prov);
  }

  return (
    <div className={UI.spPanel}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={UI.spPanelTitle}>选择省份</div>
          <div className={UI.spPanelHint}>已选择 {p.selectedProvinces.length} 个省</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 disabled:opacity-60"
            disabled={p.saving || !p.canWrite}
            onClick={selectAll}
          >
            全选
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 disabled:opacity-60"
            disabled={p.saving || !p.canWrite}
            onClick={clearAll}
          >
            清空
          </button>
        </div>
      </div>

      <div className={UI.spListBox}>
        <ul className="space-y-1">
          {CN_PROVINCES.map((prov) => {
            const checked = selected.has(prov);
            const isSplit = splitSet.has(prov);
            const blk = isBlocked(prov);

            // 省级 checkbox：split 省禁用；其它按原逻辑
            const disabled = p.saving || !p.canWrite || blk.blocked;

            // Segment 何时显示：已选中（省级）或已拆分（城市级）
            const showSegment = checked || isSplit;

            // Segment 状态
            const mode: "province" | "city" = isSplit ? "city" : "province";

            const segDisabled = p.saving || !p.canWrite;

            return (
              <li
                key={prov}
                className={`${UI.spListItem} ${blk.blocked ? "opacity-60" : UI.spListItemHover}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleProvince(prov)}
                  className="h-4 w-4"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className={checked ? "font-medium text-slate-900 text-base" : "text-slate-700 text-base"}>
                    {prov}
                  </span>
                  {blk.label && <span className={UI.spListBadge}>{blk.label}</span>}
                  {!blk.blocked && p.ownerByProvince[prov] === p.warehouseId && (
                    <span className="text-sm text-emerald-700">当前仓库</span>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-3">
                  {showSegment && (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-xl bg-slate-50 p-1 border border-slate-200">
                        <button
                          type="button"
                          className={segBtnCls(mode === "province")}
                          disabled={segDisabled || mode === "province"}
                          onClick={() => void switchToProvince(prov)}
                          title="按省命中"
                        >
                          按省
                        </button>
                        <button
                          type="button"
                          className={segBtnCls(mode === "city")}
                          disabled={segDisabled || mode === "city" || !checked}
                          onClick={() => void switchToCity(prov)}
                          title={!checked ? "请先勾选该省" : "按城市命中"}
                        >
                          按城市
                        </button>
                      </div>

                      {mode === "city" && (
                        <button
                          type="button"
                          className="text-sm text-slate-700 underline"
                          onClick={p.onJumpToCities}
                        >
                          查看城市
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
