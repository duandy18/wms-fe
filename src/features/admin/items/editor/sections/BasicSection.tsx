// src/features/admin/items/editor/sections/BasicSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";
import { CREATE_BARCODE_INPUT_ID } from "../ItemEditorContainer";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const BasicSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  return (
    <>
      {/* ===== 第一行：商品名称 / 规格 / 品牌 / 品类 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="商品名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.name} />
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="规格（可选，如：85g*12袋）"
            value={form.spec}
            onChange={(e) => setForm({ ...form, spec: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.spec} />
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="品牌（可选）"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.brand} />
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white"
            placeholder="品类（可选）"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            disabled={vm.saving}
          />
          <FieldError msg={fieldErrors.category} />
        </div>
      </div>

      {/* ===== 第二行：产品码 / 箱码 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <input
            id={CREATE_BARCODE_INPUT_ID}
            className="rounded border px-3 py-2 w-full bg-white font-mono"
            placeholder="产品码（主条码，建议扫码录入）"
            value={form.barcodes.item_barcode}
            onChange={(e) =>
              setForm({
                ...form,
                barcodes: {
                  ...form.barcodes,
                  item_barcode: e.target.value,
                },
              })
            }
            disabled={vm.saving}
          />
        </div>

        <div>
          <input
            className="rounded border px-3 py-2 w-full bg-white font-mono"
            placeholder="箱码（INNER，可选）"
            value={form.barcodes.case_barcode}
            onChange={(e) =>
              setForm({
                ...form,
                barcodes: {
                  ...form.barcodes,
                  case_barcode: e.target.value,
                },
              })
            }
            disabled={vm.saving}
          />
        </div>
      </div>

      <FieldError msg={fieldErrors.barcodes} />
    </>
  );
};

export default BasicSection;
