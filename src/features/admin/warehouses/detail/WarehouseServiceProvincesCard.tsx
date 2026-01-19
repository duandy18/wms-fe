// src/features/admin/warehouses/detail/WarehouseServiceProvincesCard.tsx
import React, { useState } from "react";
import { UI } from "./ui";
import type { ServiceProvinceConflict } from "./useWarehouseServiceProvincesModel";
import { ProvincePickerPanel } from "./ProvincePickerPanel";

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
            默认按省命中服务仓；当某省切换为“按城市”后，该省将不再参与省级命中。
          </div>
        </div>

        <button
          type="button"
          disabled={p.saving || p.loading || !p.canWrite}
          className="rounded-lg border border-slate-300 bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60"
          onClick={p.onSave}
        >
          {p.saving ? "保存中…" : "保存服务省份"}
        </button>
      </div>

      {p.saveOk && <div className="text-sm text-emerald-700">✅ 服务省份已保存</div>}

      {p.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-semibold">{p.error}</div>
          {p.conflicts.length > 0 && (
            <div className="mt-2">
              <div className="text-sm text-slate-700">冲突明细：</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
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
        <div className="text-sm text-slate-500">加载服务省份中…</div>
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
            <div className={UI.spPreviewHint}>共 {p.preview.length} 个省。</div>
            <div className={UI.spPreviewInner}>
              {p.preview.length === 0 ? (
                <div className="text-sm text-slate-500">当前为空：该仓库不会命中任何省份。</div>
              ) : (
                <ul className="space-y-1 text-sm">
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
    </section>
  );
};
