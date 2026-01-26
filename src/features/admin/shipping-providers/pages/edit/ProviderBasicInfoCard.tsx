// src/features/admin/shipping-providers/pages/edit/ProviderBasicInfoCard.tsx
import React from "react";
import type { WarehouseListItem } from "../../../warehouses/types";
import { UI } from "../../ui";
import { ProviderForm, type EditProviderFormState } from "../../edit-provider/ProviderForm";

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code && name ? `${code} ${name}` : code || name || `WH-${w.id}`;
}

export const ProviderBasicInfoCard: React.FC<{
  canWrite: boolean;
  busy: boolean;

  warehouses: WarehouseListItem[];
  warehousesLoading: boolean;
  warehouseIdStr: string;
  onWarehouseIdStrChange: (v: string) => void;

  state: EditProviderFormState;
  onChange: (patch: Partial<EditProviderFormState>) => void;

  savingProvider: boolean;
  onSaveProvider: () => void | Promise<void>;

  // ✅ 就近反馈：保存成功/失败直接显示在卡片里
  error?: string | null;
  ok?: string | null;
}> = ({
  canWrite,
  busy,
  warehouses,
  warehousesLoading,
  warehouseIdStr,
  onWarehouseIdStrChange,
  state,
  onChange,
  savingProvider,
  onSaveProvider,
  error,
  ok,
}) => {
  return (
    <section className={UI.card}>
      <div className={`${UI.h2} font-semibold text-slate-900`}>基础信息</div>

      {/* ✅ 保存反馈就近显示，避免用户滚动后“看不到错误/成功” */}
      {error ? <div className={`mt-3 ${UI.error}`}>{error}</div> : null}
      {ok ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{ok}</div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className={UI.label}>所属仓库 *</label>
          <select
            className={UI.select}
            disabled={busy || !canWrite}
            value={warehouseIdStr}
            onChange={(e) => onWarehouseIdStrChange(e.target.value)}
          >
            <option value="">{warehousesLoading ? "加载中…" : "请选择仓库"}</option>
            {(warehouses ?? []).map((w) => (
              <option key={w.id} value={String(w.id)}>
                {warehouseLabel(w)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ProviderForm state={state} busy={busy || !canWrite} savingProvider={savingProvider} onChange={onChange} onSaveProvider={onSaveProvider} />
    </section>
  );
};
