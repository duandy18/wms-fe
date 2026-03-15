// src/features/tms/providers/pages/edit/schemes/SchemeCreateBar.tsx
import React from "react";
import { UI } from "../../../ui";

type ActiveBindingWarehouse = {
  warehouse_id: number;
  warehouse_label: string;
};

export const SchemeCreateBar: React.FC<{
  disabled: boolean;
  batchBusy: boolean;
  creating: boolean;

  newName: string;
  newCurrency: string;

  activeBindingWarehouses: ActiveBindingWarehouse[];
  selectedWarehouseId: string;

  // ✅ 就近反馈（创建成功/失败）
  localErr: string | null;
  localOk: string | null;

  onChangeName: (v: string) => void;
  onChangeCurrency: (v: string) => void;
  onChangeSelectedWarehouseId: (v: string) => void;

  onCreate: () => void | Promise<void>;
}> = ({
  disabled,
  batchBusy,
  creating,
  newName,
  newCurrency,
  activeBindingWarehouses,
  selectedWarehouseId,
  localErr,
  localOk,
  onChangeName,
  onChangeCurrency,
  onChangeSelectedWarehouseId,
  onCreate,
}) => {
  const warehouseDisabled = disabled || creating || batchBusy || activeBindingWarehouses.length <= 1;

  return (
    <div className="mt-4">
      {localErr ? <div className={`mb-3 ${UI.error}`}>{localErr}</div> : null}
      {localOk ? (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{localOk}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-8">
        <div className="md:col-span-2">
          <label className={UI.label}>所属仓库 *</label>
          <select
            className={UI.select}
            value={selectedWarehouseId}
            disabled={warehouseDisabled}
            onChange={(e) => onChangeSelectedWarehouseId(e.target.value)}
          >
            <option value="">
              {activeBindingWarehouses.length <= 0
                ? "暂无可用仓库"
                : activeBindingWarehouses.length === 1
                  ? "唯一可用仓库已自动选中"
                  : "请选择仓库"}
            </option>
            {activeBindingWarehouses.map((w) => (
              <option key={w.warehouse_id} value={String(w.warehouse_id)}>
                {w.warehouse_label}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-500">这里只显示“已绑定且启用”的仓库，避免再把假仓库送进后端。</div>
        </div>

        <div className="md:col-span-3">
          <label className={UI.label}>新建收费标准名称 *</label>
          <input
            className={UI.input}
            value={newName}
            disabled={disabled || creating || batchBusy}
            placeholder="例如：河北一仓-标准件"
            onChange={(e) => onChangeName(e.target.value)}
          />
        </div>

        <div className="md:col-span-1">
          <label className={UI.label}>币种</label>
          <input
            className={UI.inputMono}
            value={newCurrency}
            disabled={disabled || creating || batchBusy}
            onChange={(e) => onChangeCurrency(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 flex items-end gap-3">
          <button type="button" className={UI.btnPrimary} disabled={disabled || creating || batchBusy} onClick={() => void onCreate()}>
            {creating ? "创建中…" : "创建收费标准"}
          </button>
        </div>
      </div>
    </div>
  );
};
