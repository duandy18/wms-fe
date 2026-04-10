// src/features/pms/items/barcodes-panel/AddBarcodeForm.tsx

import React from "react";
import type { BarcodeUomOption } from "./useItemBarcodesPanelModel";

export const ITEMS_ADD_BARCODE_INPUT_ID = "items-add-barcode-input";

export const AddBarcodeForm: React.FC<{
  newCode: string;
  selectedUomId: number | null;
  uomOptions: BarcodeUomOption[];
  saving: boolean;
  canSubmit: boolean;

  onChangeCode: (v: string) => void;
  onChangeSelectedUomId: (v: number | null) => void;

  onSubmit: (e: React.FormEvent) => void;

  /**
   * 可选：用于聚焦/自动化
   */
  inputId?: string;
}> = ({
  newCode,
  selectedUomId,
  uomOptions,
  saving,
  canSubmit,
  onChangeCode,
  onChangeSelectedUomId,
  onSubmit,
  inputId,
}) => {
  const title = !newCode.trim()
    ? "请输入条码"
    : selectedUomId == null
      ? "请选择单位"
      : "";

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-wrap items-center gap-3">
      <input
        id={inputId}
        className="min-w-[280px] rounded border px-4 py-3 text-lg font-mono"
        placeholder="新条码"
        value={newCode}
        onChange={(e) => onChangeCode(e.target.value)}
        disabled={saving}
      />

      <select
        className="min-w-[260px] rounded border px-4 py-3 text-base"
        value={selectedUomId ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChangeSelectedUomId(raw ? Number(raw) : null);
        }}
        disabled={saving || uomOptions.length === 0}
      >
        <option value="">请选择单位</option>
        {uomOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded bg-slate-900 px-5 py-3 text-lg text-white disabled:opacity-60"
        title={title}
      >
        {saving ? "保存中…" : "新增条码"}
      </button>
    </form>
  );
};

export default AddBarcodeForm;
