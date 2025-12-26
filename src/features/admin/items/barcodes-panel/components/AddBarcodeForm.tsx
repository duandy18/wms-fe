// src/features/admin/items/barcodes-panel/components/AddBarcodeForm.tsx

import React from "react";
import { UI } from "../ui";

export const AddBarcodeForm: React.FC<{
  newCode: string;
  newKind: string;
  saving: boolean;

  onChangeCode: (v: string) => void;
  onChangeKind: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}> = ({ newCode, newKind, saving, onChangeCode, onChangeKind, onSubmit }) => {
  return (
    <form className={UI.formRow} onSubmit={onSubmit}>
      <input
        className={UI.inputBarcode}
        placeholder="扫描或输入新条码"
        value={newCode}
        onChange={(e) => onChangeCode(e.target.value)}
      />

      <select className={UI.selectKind} value={newKind} onChange={(e) => onChangeKind(e.target.value)}>
        <option value="CUSTOM">CUSTOM</option>
        <option value="EAN13">EAN13</option>
        <option value="EAN8">EAN8</option>
        <option value="UPC">UPC</option>
        <option value="INNER">INNER</option>
      </select>

      <button type="submit" disabled={saving} className={UI.btnAdd}>
        {saving ? "保存中…" : "新增条码并设为主"}
      </button>
    </form>
  );
};

export default AddBarcodeForm;
