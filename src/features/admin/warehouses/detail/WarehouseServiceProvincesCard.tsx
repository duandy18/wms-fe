// src/features/admin/warehouses/detail/WarehouseServiceProvincesCard.tsx
import React, { useMemo, useState } from "react";
import { UI } from "./ui";
import type { ServiceProvinceConflict } from "./useWarehouseServiceProvincesModel";
import { ProvincePickerPanel } from "./ProvincePickerPanel";

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

export const WarehouseServiceProvincesCard: React.FC<{
  canWrite: boolean;
  warehouseId: number;

  loading: boolean;
  saving: boolean;

  error: string | null;
  saveOk: boolean;

  text: string;
  setText: (v: string) => void;

  conflicts: ServiceProvinceConflict[];
  preview: string[];

  ownerByProvince: Record<string, number>;

  citySplitProvinces: string[];

  onUpgradeProvinceToCitySplit: (province: string) => Promise<void> | void;
  onDowngradeProvinceFromCitySplit: (province: string) => Promise<void> | void;
  onJumpToCities: () => void;

  onSave: () => void;
}> = (p) => {
  const selectedSet = useMemo(() => toSet(p.preview), [p.preview]);
  const [localSelected, setLocalSelected] = useState<string[]>(p.preview);

  React.useEffect(() => {
    setLocalSelected(p.preview);
  }, [p.preview]);

  function setSelectedProvinces(next: string[]) {
    setLocalSelected(next);
    p.setText(sortZh(next).join("\n"));
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className={UI.title2}>服务省份（默认）</div>
          <div className={UI.hint}>
            默认按省命中服务仓；当某省按城市配置时，该省不再按省命中，订单必须按城市命中。
          </div>
        </div>

        <button
          type="button"
          disabled={p.saving || p.loading || !p.canWrite}
          className={UI.spBtn}
          onClick={p.onSave}
        >
          {p.saving ? "保存中…" : "保存服务省份"}
        </button>
      </div>

      {p.saveOk && <div className={UI.spOk}>✅ 服务省份已保存</div>}

      {p.error && (
        <div className={UI.spErr}>
          <div className="font-semibold">{p.error}</div>
          {p.conflicts.length > 0 && (
            <div className="mt-2">
              <div className="text-base text-slate-700">冲突明细：</div>
              <ul className="mt-1 list-disc pl-5 text-base text-slate-700">
                {p.conflicts.map((c) => (
                  <li key={`${c.province}-${c.owner_warehouse_id}`}>
                    {c.province} 已属于仓库 {c.owner_warehouse_id}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {p.loading ? (
        <div className="text-base text-slate-500">加载服务省份中…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProvincePickerPanel
            canWrite={p.canWrite}
            saving={p.saving}
            selectedProvinces={localSelected}
            setSelectedProvinces={setSelectedProvinces}
            ownerByProvince={p.ownerByProvince}
            warehouseId={p.warehouseId}
            citySplitProvinces={p.citySplitProvinces}
            onUpgradeProvinceToCitySplit={p.onUpgradeProvinceToCitySplit}
            onDowngradeProvinceFromCitySplit={p.onDowngradeProvinceFromCitySplit}
            onJumpToCities={p.onJumpToCities}
          />

          <div className={UI.spPreviewBox}>
            <div className={UI.spPreviewTitle}>预览（将被保存）</div>
            <div className={UI.spPreviewHint}>共 {p.preview.length} 个省。保存后按中文排序。</div>
            <div className={UI.spPreviewInner}>
              {p.preview.length === 0 ? (
                <div className="text-base text-slate-500">当前为空：该仓库不会命中任何省份。</div>
              ) : (
                <ul className="space-y-1 text-base">
                  {p.preview.map((prov) => (
                    <li key={prov} className="font-mono">
                      {prov}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hidden" aria-hidden="true">
        {Array.from(selectedSet).join(",")}
      </div>
    </section>
  );
};
