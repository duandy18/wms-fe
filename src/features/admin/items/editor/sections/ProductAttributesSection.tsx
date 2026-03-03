// src/features/admin/items/editor/sections/ProductAttributesSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const ProductAttributesSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  const needExpiry = form.expiry_policy === "REQUIRED";

  return (
    <>
      {/* ===== 第4/5/6行合并为一行 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 供应商 */}
        <div>
          <select
            className="rounded border px-3 py-2 w-full bg-white"
            value={form.supplier_id}
            onChange={(e) =>
              setForm({
                ...form,
                supplier_id: e.target.value,
              })
            }
            disabled={vm.saving}
          >
            <option value="">选择供应商（可选）</option>
            {vm.suppliers.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError msg={fieldErrors.supplier_id} />
        </div>

        {/* 批次来源 */}
        <div>
          <select
            className="rounded border px-3 py-2 w-full bg-white"
            value={form.lot_source_policy}
            onChange={(e) =>
              setForm({
                ...form,
                lot_source_policy: e.target.value as
                  | "SUPPLIER_ONLY"
                  | "INTERNAL_ONLY",
              })
            }
            disabled={vm.saving}
          >
            <option value="SUPPLIER_ONLY">
              批次来源：必须填写供应商批号
            </option>
            <option value="INTERNAL_ONLY">
              批次来源：系统自动生成
            </option>
          </select>
        </div>

        {/* 有效期策略 */}
        <div>
          <select
            className="rounded border px-3 py-2 w-full bg-white"
            value={form.expiry_policy}
            onChange={(e) =>
              setForm({
                ...form,
                expiry_policy: e.target.value as "NONE" | "REQUIRED",
                shelf_life_value:
                  e.target.value === "REQUIRED"
                    ? form.shelf_life_value
                    : "",
              })
            }
            disabled={vm.saving}
          >
            <option value="NONE">有效期：不需要</option>
            <option value="REQUIRED">有效期：需要</option>
          </select>
        </div>
      </div>

      {/* ===== 有效期展开配置（保持原样） ===== */}
      {needExpiry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          <div>
            <input
              className="rounded border px-3 py-2 w-full bg-white font-mono"
              placeholder="默认保质期数值（如 18）"
              value={form.shelf_life_value}
              onChange={(e) =>
                setForm({
                  ...form,
                  shelf_life_value: e.target.value,
                })
              }
              disabled={vm.saving}
              inputMode="numeric"
            />
            <FieldError msg={fieldErrors.shelf_life_value} />
          </div>

          <div>
            <select
              className="rounded border px-3 py-2 w-full bg-white"
              value={form.shelf_life_unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  shelf_life_unit: e.target.value as
                    | "DAY"
                    | "WEEK"
                    | "MONTH"
                    | "YEAR",
                })
              }
              disabled={vm.saving}
            >
              <option value="DAY">单位：天</option>
              <option value="WEEK">单位：周</option>
              <option value="MONTH">单位：月</option>
              <option value="YEAR">单位：年</option>
            </select>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductAttributesSection;
