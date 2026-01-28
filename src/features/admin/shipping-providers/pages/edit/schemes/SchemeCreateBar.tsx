// src/features/admin/shipping-providers/pages/edit/schemes/SchemeCreateBar.tsx
import React from "react";
import { UI } from "../../../ui";

export const SchemeCreateBar: React.FC<{
  disabled: boolean;
  batchBusy: boolean;
  creating: boolean;

  newName: string;
  newCurrency: string;

  // ✅ 就近反馈（创建成功/失败）
  localErr: string | null;
  localOk: string | null;

  onChangeName: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreate: () => void | Promise<void>;
}> = ({
  disabled,
  batchBusy,
  creating,
  newName,
  newCurrency,
  localErr,
  localOk,
  onChangeName,
  onChangeCurrency,
  onCreate,
}) => {
  return (
    <div className="mt-4">
      {localErr ? <div className={`mb-3 ${UI.error}`}>{localErr}</div> : null}
      {localOk ? (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{localOk}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-8">
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
