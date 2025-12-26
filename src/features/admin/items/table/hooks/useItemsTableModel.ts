// src/features/admin/items/table/hooks/useItemsTableModel.ts
//
// ItemsTable 状态 / orchestration
// - suppliers 下拉数据加载
// - 行定位（selectedItem -> scrollIntoView）
// - 行内编辑 draft 管理 + 保存校验 + updateItem + reload

import { useEffect, useMemo, useRef, useState } from "react";
import { useItemsStore } from "../../itemsStore";
import type { Item } from "../../api";
import { updateItem } from "../../api";
import { fetchSuppliersBasic, type SupplierBasic } from "../../../../../master-data/suppliersApi";

type ApiErrorShape = { message?: string };

export type RowDraft = {
  name: string;
  spec: string;
  uom: string;
  enabled: boolean;
  supplierId: number | null;
  weightKgText: string;
};

export function useItemsTableModel() {
  const items = useItemsStore((s) => s.items);
  const loading = useItemsStore((s) => s.loading);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
  const barcodeCounts = useItemsStore((s) => s.barcodeCounts);
  const filter = useItemsStore((s) => s.filter);
  const selectedItem = useItemsStore((s) => s.selectedItem);

  const loadItems = useItemsStore((s) => s.loadItems);
  const setError = useItemsStore((s) => s.setError);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);

  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  const [suppliers, setSuppliers] = useState<SupplierBasic[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RowDraft>({
    name: "",
    spec: "",
    uom: "",
    enabled: true,
    supplierId: null,
    weightKgText: "",
  });

  const [savingId, setSavingId] = useState<number | null>(null);

  // suppliers list
  useEffect(() => {
    const loadSuppliers = async () => {
      setSuppliersLoading(true);
      try {
        const data = await fetchSuppliersBasic();
        setSuppliers(data.filter((s) => s.active !== false));
      } finally {
        setSuppliersLoading(false);
      }
    };
    void loadSuppliers();
  }, []);

  // scroll to selected row
  useEffect(() => {
    if (!selectedItem) return;
    const row = rowRefs.current[selectedItem.id];
    if (row && typeof row.scrollIntoView === "function") {
      row.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selectedItem]);

  const displayItems = useMemo(() => {
    return items.filter((it: Item) => {
      const enabled = it.enabled ?? true;
      if (filter === "enabled") return !!enabled;
      if (filter === "disabled") return !enabled;
      return true;
    });
  }, [items, filter]);

  function startEdit(it: Item) {
    setEditingId(it.id);
    setDraft({
      name: it.name,
      spec: it.spec ?? "",
      uom: it.uom ?? "",
      enabled: it.enabled ?? true,
      supplierId: it.supplier_id ?? null,
      weightKgText: it.weight_kg !== null && it.weight_kg !== undefined ? String(it.weight_kg) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setSavingId(null);
  }

  async function handleSave(id: number) {
    setSavingId(id);
    setError(null);

    let weight_kg: number | null = null;
    const trimmed = draft.weightKgText.trim();
    if (trimmed) {
      const num = Number(trimmed);
      if (!Number.isFinite(num) || num < 0) {
        setError("重量(kg) 必须是大于等于 0 的数字");
        setSavingId(null);
        return;
      }
      weight_kg = num;
    }

    try {
      await updateItem(id, {
        name: draft.name,
        spec: draft.spec || null,
        uom: draft.uom || null,
        enabled: draft.enabled,
        supplier_id: draft.supplierId ?? null,
        weight_kg,
      });
      await loadItems();
      setEditingId(null);
    } catch (e: unknown) {
      const err = e as ApiErrorShape;
      setError(err?.message ?? "更新商品失败");
    } finally {
      setSavingId(null);
    }
  }

  function openBarcodes(it: Item) {
    setSelectedItem(it);
    setPanelOpen(true);
  }

  return {
    // store state
    loading,
    items: displayItems,
    selectedItemId: selectedItem?.id ?? null,

    // barcode info
    primaryBarcodes,
    barcodeCounts,

    // suppliers
    suppliers,
    suppliersLoading,

    // row refs
    rowRefs,

    // editing
    editingId,
    draft,
    setDraft,
    savingId,

    // actions
    startEdit,
    cancelEdit,
    handleSave,
    openBarcodes,
  };
}

export default useItemsTableModel;
