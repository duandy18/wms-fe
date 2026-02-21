// src/features/admin/items/barcodes-panel/useItemBarcodesPanelModel.ts

import { useEffect, useMemo, useState } from "react";
import { useItemsStore } from "../itemsStore";
import {
  fetchItemBarcodes,
  createItemBarcode,
  deleteItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "../../../../master-data/itemBarcodesApi";
import { getErrorMessage } from "./errors";

export type BarcodeKind = "CUSTOM" | "EAN13" | "EAN8" | "UPC" | "INNER";

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

export function useItemBarcodesPanelModel(args?: UseItemBarcodesPanelModelArgs) {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const setPrimaryBarcodeLocal = useItemsStore((s) => s.setPrimaryBarcodeLocal);
  const loadItems = useItemsStore((s) => s.loadItems);

  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);

  const explicitItemId = args?.itemId;
  const itemId: number | null = explicitItemId != null ? explicitItemId : (selectedItem ? selectedItem.id : null);

  const [barcodes, setBarcodes] = useState<ItemBarcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newKind, setNewKind] = useState<BarcodeKind>("CUSTOM");
  const [saving, setSaving] = useState(false);

  const hasSelection = itemId != null;

  const closePanel = () => {
    // Inline 模式：不允许清空 store 状态
    if (explicitItemId != null || args?.disableClosePanel) return;

    setSelectedItem(null);

    setBarcodes([]);
    setError(null);
    setNewCode("");
    setNewKind("CUSTOM");
    setSaving(false);
    setLoading(false);

    setScannedBarcode(null);
  };

  const updatePrimaryLocal = (list: ItemBarcode[]) => {
    if (itemId == null) return;
    const primary = list.find((b) => b.is_primary);
    setPrimaryBarcodeLocal(itemId, primary ? primary.barcode : null);
  };

  const refresh = async () => {
    if (itemId == null) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchItemBarcodes(itemId);
      setBarcodes(list);
      updatePrimaryLocal(list);
      await loadItems();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码列表失败"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId == null) {
      setBarcodes([]);
      setError(null);
      setNewCode("");
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchItemBarcodes(itemId);
        if (cancelled) return;
        setBarcodes(list);
        updatePrimaryLocal(list);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(e, "加载条码失败"));
          setBarcodes([]);
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
    return true;
  }, [itemId, saving, newCode]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemId == null) return;

    const code = newCode.trim();
    if (!code) {
      setError("条码不能为空");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createItemBarcode({
        item_id: itemId,
        barcode: code,
        kind: newKind,
        active: true,
      });

      await setPrimaryBarcode(created.id);
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

    barcodes,
    loading,
    error,

    newCode,
    newKind,
    saving,
    canSubmit,

    setNewCode,
    setNewKind,
    setError,

    closePanel,
    refresh,

    handleAdd,
    handleDelete,
    handleSetPrimary,
  };
}
