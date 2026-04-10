// src/features/pms/items/barcodes-panel/useItemBarcodesPanelModel.ts

import { useEffect, useMemo, useState } from "react";
import { useItemsStore } from "../model/itemsStore";
import {
  fetchItemBarcodeRows,
  createItemBarcode,
  deleteItemBarcode,
  setPrimaryBarcode,
  type ItemBarcodeCompositeRow,
} from "../api/itemBarcodesOwnerApi";
import { fetchItemUoms, type ItemUom } from "../api/itemUomsOwnerApi";
import { getErrorMessage } from "./errors";

export type BarcodeUomOption = {
  id: number;
  label: string;
  ratio_to_base: number;
  is_base: boolean;
  is_purchase_default: boolean;
};

type UseItemBarcodesPanelModelArgs = {
  /**
   * Inline 模式：直接指定 itemId（不依赖 store.selectedItem）
   */
  itemId?: number;
  /**
   * Inline 模式可选：禁用 closePanel 行为（默认 false）
   */
  disableClosePanel?: boolean;
};

function hasPrimary(list: ItemBarcodeCompositeRow[]): boolean {
  return list.some((row) => Boolean(row.is_primary));
}

function sortUoms(list: ItemUom[]): ItemUom[] {
  return [...list].sort((a, b) => {
    if (a.is_base !== b.is_base) return a.is_base ? -1 : 1;
    if (a.ratio_to_base !== b.ratio_to_base) return a.ratio_to_base - b.ratio_to_base;
    return a.id - b.id;
  });
}

function buildUomLabel(uom: ItemUom): string {
  const name = (uom.display_name ?? "").trim() || uom.uom;
  const tags: string[] = [];
  if (uom.is_base) tags.push("最小单位");
  if (uom.is_purchase_default) tags.push("采购默认");
  const suffix = tags.length > 0 ? `，${tags.join(" / ")}` : "";
  return `${name}（倍率 ${uom.ratio_to_base}${suffix}）`;
}

function buildUomOptions(uoms: ItemUom[]): BarcodeUomOption[] {
  return sortUoms(uoms).map((uom) => ({
    id: uom.id,
    label: buildUomLabel(uom),
    ratio_to_base: uom.ratio_to_base,
    is_base: uom.is_base,
    is_purchase_default: uom.is_purchase_default,
  }));
}

export function useItemBarcodesPanelModel(args?: UseItemBarcodesPanelModelArgs) {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const setPrimaryBarcodeLocal = useItemsStore((s) => s.setPrimaryBarcodeLocal);
  const loadItems = useItemsStore((s) => s.loadItems);

  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);

  const explicitItemId = args?.itemId;
  const itemId: number | null = explicitItemId != null ? explicitItemId : selectedItem ? selectedItem.id : null;

  const [rows, setRows] = useState<ItemBarcodeCompositeRow[]>([]);
  const [uomOptions, setUomOptions] = useState<BarcodeUomOption[]>([]);
  const [selectedUomId, setSelectedUomId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [saving, setSaving] = useState(false);

  const hasSelection = itemId != null;

  const closePanel = () => {
    // Inline 模式：不允许清空 store 状态
    if (explicitItemId != null || args?.disableClosePanel) return;

    setSelectedItem(null);

    setRows([]);
    setUomOptions([]);
    setSelectedUomId(null);
    setError(null);
    setNewCode("");
    setSaving(false);
    setLoading(false);

    setScannedBarcode(null);
  };

  const updatePrimaryLocal = (nextRows: ItemBarcodeCompositeRow[]) => {
    if (itemId == null) return;
    const primary = nextRows.find((row) => row.is_primary);
    setPrimaryBarcodeLocal(itemId, primary ? primary.barcode : null);
  };

  const applyRows = (nextRows: ItemBarcodeCompositeRow[]) => {
    setRows(nextRows);
    updatePrimaryLocal(nextRows);
  };

  const applyUoms = (uoms: ItemUom[]) => {
    const nextOptions = buildUomOptions(uoms);
    setUomOptions(nextOptions);

    setSelectedUomId((current) => {
      if (current != null && nextOptions.some((x) => x.id === current)) return current;
      const base = nextOptions.find((x) => x.is_base) ?? null;
      return base?.id ?? nextOptions[0]?.id ?? null;
    });
  };

  const refresh = async () => {
    if (itemId == null) return;
    setLoading(true);
    setError(null);
    try {
      const [nextRows, nextUoms] = await Promise.all([
        fetchItemBarcodeRows(itemId, false),
        fetchItemUoms(itemId),
      ]);
      applyRows(nextRows);
      applyUoms(nextUoms);
      await loadItems();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码列表失败"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId == null) {
      setRows([]);
      setUomOptions([]);
      setSelectedUomId(null);
      setError(null);
      setNewCode("");
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextRows, nextUoms] = await Promise.all([
          fetchItemBarcodeRows(itemId, false),
          fetchItemUoms(itemId),
        ]);
        if (cancelled) return;
        applyRows(nextRows);
        applyUoms(nextUoms);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(e, "加载条码失败"));
          setRows([]);
          setUomOptions([]);
          setSelectedUomId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    // 只有 Panel 模式才从 scannedBarcode 带入输入框
    if (explicitItemId != null) return;
    if (!scannedBarcode) return;
    setNewCode(scannedBarcode);
  }, [explicitItemId, scannedBarcode]);

  const canSubmit = useMemo(() => {
    if (itemId == null) return false;
    if (saving) return false;
    if (!newCode.trim()) return false;
    if (selectedUomId == null || selectedUomId <= 0) return false;
    return true;
  }, [itemId, saving, newCode, selectedUomId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemId == null) return;

    const code = newCode.trim();
    if (!code) {
      setError("条码不能为空");
      return;
    }

    if (selectedUomId == null || selectedUomId <= 0) {
      setError("请选择单位");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createItemBarcode({
        item_uom_id: selectedUomId,
        barcode: code,
        symbology: "CUSTOM",
        active: true,
      });

      const target = uomOptions.find((x) => x.id === selectedUomId) ?? null;
      const shouldAutoPrimary = Boolean(target?.is_base) && !hasPrimary(rows);

      if (shouldAutoPrimary) {
        await setPrimaryBarcode(created.id);
      }

      await refresh();
      setNewCode("");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "新增条码失败"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (itemId == null) return;
    if (!window.confirm("确认删除该条码吗？")) return;

    try {
      await deleteItemBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "删除条码失败"));
    }
  };

  const handleSetPrimary = async (id: number) => {
    if (itemId == null) return;
    try {
      await setPrimaryBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "设置主条码失败"));
    }
  };

  return {
    itemId,
    hasSelection,

    rows,
    uomOptions,
    selectedUomId,

    loading,
    error,

    newCode,
    saving,
    canSubmit,

    setNewCode,
    setSelectedUomId,
    setError,

    closePanel,
    refresh,

    handleAdd,
    handleDelete,
    handleSetPrimary,
  };
}
