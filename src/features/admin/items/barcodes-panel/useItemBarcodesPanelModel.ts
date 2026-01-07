// src/features/admin/items/barcodes-panel/useItemBarcodesPanelModel.ts

import { useEffect, useMemo, useState } from "react";
import { useItemsStore } from "../itemsStore";
import {
  fetchItemBarcodes,
  createItemBarcode,
  deleteItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "../barcodesApi";
import { getErrorMessage } from "./errors";

export type BarcodeKind = "CUSTOM" | "EAN13" | "EAN8" | "UPC" | "INNER";

export function useItemBarcodesPanelModel() {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const setPrimaryBarcodeLocal = useItemsStore((s) => s.setPrimaryBarcodeLocal);
  const loadItems = useItemsStore((s) => s.loadItems);

  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);
  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);

  const [barcodes, setBarcodes] = useState<ItemBarcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newKind, setNewKind] = useState<BarcodeKind>("CUSTOM");
  const [saving, setSaving] = useState(false);

  const hasSelection = !!selectedItem;

  const closePanel = () => {
    setSelectedItem(null);
    setPanelOpen(false);

    setBarcodes([]);
    setError(null);
    setNewCode("");
    setNewKind("CUSTOM");
    setSaving(false);
    setLoading(false);

    setScannedBarcode(null);
  };

  const updatePrimaryLocal = (list: ItemBarcode[]) => {
    if (!selectedItem) return;
    const primary = list.find((b) => b.is_primary);
    setPrimaryBarcodeLocal(selectedItem.id, primary ? primary.barcode : null);
  };

  const refresh = async () => {
    if (!selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchItemBarcodes(selectedItem.id);
      setBarcodes(list);
      updatePrimaryLocal(list);
      await loadItems();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码列表失败"));
    } finally {
      setLoading(false);
    }
  };

  // 选中商品变化时加载条码
  useEffect(() => {
    if (!selectedItem) {
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
        const list = await fetchItemBarcodes(selectedItem.id);
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
  }, [selectedItem?.id]);

  // 扫码结果自动填入“新条码”
  useEffect(() => {
    if (!scannedBarcode) return;
    setNewCode(scannedBarcode);
  }, [scannedBarcode]);

  const canSubmit = useMemo(() => {
    if (!selectedItem) return false;
    if (saving) return false;
    if (!newCode.trim()) return false;
    return true;
  }, [selectedItem, saving, newCode]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const code = newCode.trim();
    if (!code) {
      setError("条码不能为空");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createItemBarcode({
        item_id: selectedItem.id,
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
    if (!selectedItem) return;
    if (!window.confirm("确认删除该条码吗？")) return;

    try {
      await deleteItemBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "删除条码失败"));
    }
  };

  const handleSetPrimary = async (id: number) => {
    if (!selectedItem) return;
    try {
      await setPrimaryBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "设置主条码失败"));
    }
  };

  return {
    selectedItem,
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
