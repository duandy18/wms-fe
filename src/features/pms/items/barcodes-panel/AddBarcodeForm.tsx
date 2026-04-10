// src/features/pms/items/barcodes-panel/AddBarcodeForm.tsx

import React from "react";
import type { BarcodeUomOption } from "./useItemBarcodesPanelModel";

export const ITEMS_ADD_BARCODE_INPUT_ID = "items-add-barcode-input";

export const AddBarcodeForm: React.FC<{
  mode: "create" | "edit";
  newCode: string;
  selectedUomId: number | null;
  uomOptions: BarcodeUomOption[];
  isPrimary: boolean;
  saving: boolean;
  canSubmit: boolean;

  onChangeCode: (v: string) => void;
  onChangeSelectedUomId: (v: number | null) => void;
  onChangeIsPrimary: (v: boolean) => void;

  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit?: () => void;

  inputId?: string;
}> = ({
  mode,
  newCode,
  selectedUomId,
  uomOptions,
  isPrimary,
  saving,
  canSubmit,
  onChangeCode,
  onChangeSelectedUomId,
  onChangeIsPrimary,
  onSubmit,
  onCancelEdit,
  inputId,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,0.9fr)_minmax(300px,1.2fr)_auto]">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">包装单位</label>
          <select
            className="w-full rounded border px-3 py-2 bg-white"
            value={selectedUomId ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChangeSelectedUomId(raw ? Number(raw) : null);
            }}
            disabled={saving || uomOptions.length === 0}
          >
            <option value="">请选择包装单位</option>
            {uomOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">条码</label>
          <input
            id={inputId}
            className="w-full rounded border px-3 py-2 bg-white font-mono"
            placeholder="请输入或扫描条码"
            value={newCode}
            onChange={(e) => onChangeCode(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col justify-end gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => onChangeIsPrimary(e.target.checked)}
              disabled={saving}
            />
            是否主条码
          </label>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? "保存中…" : mode === "edit" ? "保存修改" : "绑定条码"}
            </button>

            {mode === "edit" ? (
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={saving}
                className="rounded border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                取消修改
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddBarcodeForm;
