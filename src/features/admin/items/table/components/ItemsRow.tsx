// src/features/admin/items/table/components/ItemsRow.tsx
//
// 表格行渲染（纯展示 + 行内交互）
// - draft / editingId / handlers 全由上层注入

import React from "react";
import type { Item } from "../../api";
import type { SupplierBasic } from "../../../../../master-data/suppliersApi";
import type { RowDraft } from "../hooks/useItemsTableModel";
import { UI } from "../ui";

export const ItemsRow: React.FC<{
  it: Item;

  isSelected: boolean;

  primary: string;
  barcodeCount: number;

  supplierName: string;

  isEditing: boolean;
  suppliers: SupplierBasic[];
  suppliersLoading: boolean;

  draft: RowDraft;
  onChangeDraft: (patch: Partial<RowDraft>) => void;

  saving: boolean;

  onOpenBarcodes: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;

  rowRef: (el: HTMLTableRowElement | null) => void;
}> = ({
  it,
  isSelected,
  primary,
  barcodeCount,
  supplierName,
  isEditing,
  suppliers,
  suppliersLoading,
  draft,
  onChangeDraft,
  saving,
  onOpenBarcodes,
  onStartEdit,
  onCancelEdit,
  onSave,
  rowRef,
}) => {
  const enabled = it.enabled ?? true;
  const createdAt = it.created_at ?? "";
  const weightVal = it.weight_kg;

  const rowCls = UI.trBase + " " + (isSelected ? UI.trSelected : enabled ? "" : UI.trDisabled);

  return (
    <tr key={it.id} ref={rowRef} className={rowCls}>
      <td className={UI.td}>{it.id}</td>

      <td className={UI.tdMono}>{it.sku}</td>

      {/* 名称 */}
      <td className={UI.td}>
        {isEditing ? (
          <input className={UI.inputName} value={draft.name} onChange={(e) => onChangeDraft({ name: e.target.value })} />
        ) : (
          it.name
        )}
      </td>

      {/* 规格 */}
      <td className={UI.td}>
        {isEditing ? (
          <input className={UI.inputSpec} value={draft.spec} onChange={(e) => onChangeDraft({ spec: e.target.value })} />
        ) : (
          it.spec || "-"
        )}
      </td>

      {/* 单位 */}
      <td className={UI.td}>
        {isEditing ? (
          <input className={UI.inputUom} value={draft.uom} onChange={(e) => onChangeDraft({ uom: e.target.value })} />
        ) : (
          it.uom || "-"
        )}
      </td>

      {/* 重量(kg) */}
      <td className={UI.tdRight}>
        {isEditing ? (
          <input
            className={UI.inputMonoRight}
            value={draft.weightKgText}
            onChange={(e) => onChangeDraft({ weightKgText: e.target.value })}
            placeholder={weightVal !== null && weightVal !== undefined ? String(weightVal) : ""}
          />
        ) : weightVal !== null && weightVal !== undefined ? (
          <span className="font-mono">{weightVal}</span>
        ) : (
          "-"
        )}
      </td>

      {/* 供应商 */}
      <td className={UI.td}>
        {isEditing ? (
          <select
            className={UI.selectSupplier}
            value={draft.supplierId ?? ""}
            disabled={suppliersLoading}
            onChange={(e) => onChangeDraft({ supplierId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">无（暂不指定）</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `[${s.code}] ${s.name}` : s.name}
              </option>
            ))}
          </select>
        ) : (
          supplierName || "-"
        )}
      </td>

      {/* 主条码 */}
      <td className={`${UI.td} font-mono`}>{primary}</td>

      {/* 条码数量 */}
      <td className={UI.td}>{barcodeCount}</td>

      {/* 状态 */}
      <td className={UI.td}>{enabled ? <span className={UI.pillOn}>启用</span> : <span className={UI.pillOff}>已停用</span>}</td>

      {/* 创建时间 */}
      <td className="whitespace-nowrap px-3 py-2">{createdAt}</td>

      {/* 操作 */}
      <td className="whitespace-nowrap px-3 py-2">
        <button type="button" className={`mr-2 ${UI.btn}`} onClick={onOpenBarcodes}>
          管理条码
        </button>

        {isEditing ? (
          <>
            <button type="button" className={UI.btnSave} disabled={saving} onClick={onSave}>
              {saving ? "保存中…" : "保存"}
            </button>
            <button type="button" className={UI.btnCancel} onClick={onCancelEdit}>
              取消
            </button>
          </>
        ) : (
          <button type="button" className={UI.btn} onClick={onStartEdit}>
            编辑商品
          </button>
        )}
      </td>
    </tr>
  );
};

export default ItemsRow;
