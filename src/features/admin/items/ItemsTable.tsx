// src/features/admin/items/ItemsTable.tsx
// 商品列表（商品主数据核心视图）
//
// 职责收敛：
// - 本文件只做：取 store 状态、过滤 rows、打开编辑、保存、渲染两个子组件（表格 + 编辑弹窗）
// - 表格渲染交给 components/ItemsListTable
// - 编辑弹窗交给 components/ItemEditModal
// - 供应商 options 由 hook 统一加载（带缓存/错误）

import React, { useMemo, useState } from "react";
import { useItemsStore } from "./itemsStore";
import { updateItem, type Item } from "./api";
import { useSuppliersOptions } from "./hooks/useSuppliersOptions";
import { errMsg, toNumberOrNull } from "./itemsHelpers";
import ItemsListTable from "./components/ItemsListTable";
import ItemEditModal, { type ItemDraft } from "./components/ItemEditModal";

function hasShelfLife(it: Item): boolean {
  return !!it.has_shelf_life;
}

export const ItemsTable: React.FC = () => {
  const items = useItemsStore((s) => s.items);
  const filter = useItemsStore((s) => s.filter);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const loadItems = useItemsStore((s) => s.loadItems);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);

  const rows = useMemo(() => {
    if (filter === "enabled") return items.filter((i) => i.enabled);
    if (filter === "disabled") return items.filter((i) => !i.enabled);
    return items;
  }, [items, filter]);

  const { suppliers, supLoading, supError, ensureSuppliers, resetSuppliersError } =
    useSuppliersOptions();

  const [editing, setEditing] = useState<Item | null>(null);
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEdit = async (it: Item) => {
    await ensureSuppliers();

    const uom = (it.uom ?? "").trim();
    const COMMON_UOMS = ["袋", "个", "罐", "箱", "瓶"];
    const presetHit = COMMON_UOMS.includes(uom);

    const hasSL = hasShelfLife(it);

    setEditing(it);
    setError(null);
    resetSuppliersError();

    setDraft({
      name: it.name ?? "",

      // ✅ brand/category：主数据可维护字段（空 -> ""，提交时再转 null）
      brand: (it.brand ?? "").trim(),
      category: (it.category ?? "").trim(),

      supplier_id: it.supplier_id ?? null,
      weight_kg: it.weight_kg == null ? "" : String(it.weight_kg),

      uom_mode: presetHit ? "preset" : "custom",
      uom_preset: presetHit ? uom : (COMMON_UOMS[0] ?? "个"),
      uom_custom: presetHit ? "" : uom,

      shelf_mode: hasSL ? "yes" : "no",
      shelf_value: hasSL ? (it.shelf_life_value == null ? "" : String(it.shelf_life_value)) : "",
      shelf_unit: (it.shelf_life_unit ?? "MONTH") as "MONTH" | "DAY",

      enabled: !!it.enabled,
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setDraft(null);
    setError(null);
    resetSuppliersError();
  };

  const saveEdit = async () => {
    if (!editing || !draft) return;

    const name = draft.name.trim();
    if (!name) return setError("商品名称不能为空");

    if (!draft.supplier_id) return setError("必须选择供货商");

    const uom = draft.uom_mode === "preset" ? draft.uom_preset.trim() : draft.uom_custom.trim();
    if (!uom) return setError("最小包装单位不能为空");

    const weight_kg = toNumberOrNull(draft.weight_kg);
    if (weight_kg !== null && weight_kg < 0) return setError("单位净重必须是 >= 0 的数字");

    const has_shelf_life = draft.shelf_mode === "yes";
    let shelf_life_value: number | undefined = undefined;
    let shelf_life_unit: "MONTH" | "DAY" | undefined = undefined;

    if (has_shelf_life && draft.shelf_value.trim()) {
      const n = toNumberOrNull(draft.shelf_value);
      if (n === null || n < 0) return setError("默认有效期数值必须是 >= 0 的数字");
      shelf_life_value = n;
      shelf_life_unit = draft.shelf_unit;
    }

    setSaving(true);
    setError(null);
    try {
      await updateItem(editing.id, {
        name,
        supplier_id: draft.supplier_id,
        weight_kg: weight_kg === null ? null : weight_kg,
        uom,

        // ✅ 保存 brand/category（api.ts 会将空串转成 null）
        brand: draft.brand,
        category: draft.category,

        enabled: draft.enabled,
        has_shelf_life,
        ...(shelf_life_value !== undefined ? { shelf_life_value } : {}),
        ...(shelf_life_unit !== undefined ? { shelf_life_unit } : {}),
      });
      await loadItems();
      closeEdit();
    } catch (e: unknown) {
      setError(errMsg(e, "保存失败"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ItemsListTable
        rows={rows}
        primaryBarcodes={primaryBarcodes}
        onEdit={(it) => void openEdit(it)}
        onManageBarcodes={(it) => {
          setSelectedItem(it);
          setPanelOpen(true);
        }}
      />

      {editing && draft ? (
        <ItemEditModal
          open={true}
          saving={saving}
          suppliers={suppliers}
          supLoading={supLoading}
          error={error}
          supError={supError}
          draft={draft}
          onChangeDraft={setDraft}
          onClose={closeEdit}
          onSave={() => void saveEdit()}
        />
      ) : null}
    </>
  );
};

export default ItemsTable;
