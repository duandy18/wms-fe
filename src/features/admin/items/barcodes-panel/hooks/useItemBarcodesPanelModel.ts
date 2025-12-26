// src/features/admin/items/barcodes-panel/hooks/useItemBarcodesPanelModel.ts
//
// ItemBarcodesPanel 状态 / orchestration
// - selectedItem 变化：加载条码 + 同步 primary 到 store
// - scannedBarcode 变化：灌入新增输入框
// - add/delete/setPrimary：调用 API + refresh
// - 保持原有行为，不引入新模型

import { useEffect, useState } from "react";
import { useItemsStore } from "../../itemsStore";
import {
  fetchItemBarcodes,
  createItemBarcode,
  deleteItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "../../barcodesApi";

type ApiErrorShape = {
  message?: string;
  response?: { data?: { detail?: string } };
};

function getErrorMessage(e: unknown, fallback: string): string {
  const err = e as ApiErrorShape;
  return err?.response?.data?.detail ?? err?.message ?? fallback;
}

export function useItemBarcodesPanelModel() {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const setPrimaryBarcodeLocal = useItemsStore((s) => s.setPrimaryBarcodeLocal);
  const loadItems = useItemsStore((s) => s.loadItems);

  const [barcodes, setBarcodes] = useState<ItemBarcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newKind, setNewKind] = useState("CUSTOM");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    if (!selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchItemBarcodes(selectedItem.id);
      setBarcodes(list);
      const primary = list.find((b) => b.is_primary);
      setPrimaryBarcodeLocal(selectedItem.id, primary ? primary.barcode : null);
      await loadItems();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码列表失败"));
    } finally {
      setLoading(false);
    }
  }

  // selectedItem 变化 -> 加载
  useEffect(() => {
    if (!selectedItem) {
      setBarcodes([]);
      setError(null);
      setNewCode("");
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchItemBarcodes(selectedItem.id);
        if (cancelled) return;
        setBarcodes(list);
        const primary = list.find((b) => b.is_primary);
        setPrimaryBarcodeLocal(selectedItem.id, primary ? primary.barcode : null);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(e, "加载条码失败"));
          setBarcodes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedItem, setPrimaryBarcodeLocal]);

  // scannedBarcode -> 灌入新增输入框
  useEffect(() => {
    if (!scannedBarcode) return;
    setNewCode(scannedBarcode);
  }, [scannedBarcode]);

  async function addBarcode(e: React.FormEvent) {
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
        kind: newKind || "CUSTOM",
        active: true,
      });

      await setPrimaryBarcode(created.id);
      await refresh();
      setNewCode("");
    } catch (e2: unknown) {
      setError(getErrorMessage(e2, "新增条码失败"));
    } finally {
      setSaving(false);
    }
  }

  async function removeBarcode(id: number) {
    if (!selectedItem) return;
    if (!window.confirm("确认删除该条码吗？")) return;

    try {
      await deleteItemBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "删除条码失败"));
    }
  }

  async function setPrimary(id: number) {
    if (!selectedItem) return;
    try {
      await setPrimaryBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "设置主条码失败"));
    }
  }

  return {
    selectedItem,

    barcodes,
    loading,
    error,
    setError,

    newCode,
    setNewCode,
    newKind,
    setNewKind,
    saving,

    refresh,
    addBarcode,
    removeBarcode,
    setPrimary,
  };
}

export default useItemBarcodesPanelModel;
