// src/features/admin/items/barcodes-panel/AddBarcodeForm.tsx

import React from "react";
import type { BarcodeKind } from "./useItemBarcodesPanelModel";

export const ITEMS_ADD_BARCODE_INPUT_ID = "items-add-barcode-input";

export const AddBarcodeForm: React.FC<{
  newCode: string;
  newKind: BarcodeKind;
  saving: boolean;
  canSubmit: boolean;

  onChangeCode: (v: string) => void;
  onChangeKind: (v: BarcodeKind) => void;

  onSubmit: (e: React.FormEvent) => void;

  /**
   * 可选：用于聚焦/自动化
   */
  inputId?: string;
}> = ({
  newCode,
  newKind,
  saving,
  canSubmit,
  onChangeCode,
  onChangeKind,
  onSubmit,
  inputId,
}) => {
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
        className="rounded border px-4 py-3 text-lg"
        value={newKind}
        onChange={(e) => onChangeKind(e.target.value as BarcodeKind)}
        disabled={saving}
      >
        <option value="CUSTOM">CUSTOM</option>
        <option value="EAN13">EAN13</option>
        <option value="EAN8">EAN8</option>
        <option value="UPC">UPC</option>
        <option value="INNER">INNER</option>
      </select>

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded bg-slate-900 px-5 py-3 text-lg text-white disabled:opacity-60"
        title={!newCode.trim() ? "请输入条码" : ""}
      >
        {saving ? "保存中…" : "新增并设为主"}
      </button>
    </form>
  );
};

export default AddBarcodeForm;
