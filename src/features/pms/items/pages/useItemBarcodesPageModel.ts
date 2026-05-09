// src/features/pms/items/pages/useItemBarcodesPageModel.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Item } from "../../../../contracts/item/contract";
import { probeItemBarcode } from "../../../../domains/pms/export/barcodeProbeClient";
import type { ItemBarcodeCompositeRow } from "../api/itemBarcodesOwnerApi";
import { fetchItemUomRowsByItems } from "../api/itemUomsOwnerApi";
import { fetchItems } from "../api/itemsOwnerApi";

function buildSearchText(item: Item): string {
  return [
    item.sku,
    item.name,
    item.spec ?? "",
    item.brand ?? "",
    item.category ?? "",
    item.supplier_name ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function rowDisplayName(row: Pick<ItemBarcodeCompositeRow, "display_name" | "uom">): string {
  return row.display_name?.trim() || row.uom;
}

function sortGlobalBarcodeRows(rows: ItemBarcodeCompositeRow[]): ItemBarcodeCompositeRow[] {
  return [...rows].sort((a, b) => {
    if (a.sku !== b.sku) return a.sku.localeCompare(b.sku, "zh-CN");
    if (a.item_name !== b.item_name) return a.item_name.localeCompare(b.item_name, "zh-CN");
    if (a.ratio_to_base !== b.ratio_to_base) return a.ratio_to_base - b.ratio_to_base;

    const aName = rowDisplayName(a);
    const bName = rowDisplayName(b);
    if (aName !== bName) return aName.localeCompare(bName, "zh-CN");

    if (a.barcode !== b.barcode) return a.barcode.localeCompare(b.barcode, "zh-CN");
    return a.item_uom_id - b.item_uom_id;
  });
}

export function useItemBarcodesPageModel() {
  const location = useLocation();

  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [barcodeHint, setBarcodeHint] = useState<string | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);

  const [rows, setRows] = useState<ItemBarcodeCompositeRow[]>([]);
  const [editingRow, setEditingRow] = useState<ItemBarcodeCompositeRow | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const barcodeFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("barcode");
    return code && code.trim() ? code.trim() : null;
  }, [location.search]);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => buildSearchText(item).includes(q));
  }, [items, keyword]);

  const selectedItem = useMemo(() => {
    if (selectedItemId == null) return null;
    return items.find((x) => x.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const loadItemsOnly = useCallback(async (): Promise<Item[]> => {
    setLoadingItems(true);
    setError(null);
    try {
      const list = await fetchItems();
      setItems(list);

      setSelectedItemId((current) => {
        if (current != null && list.some((x) => x.id === current)) return current;
        return current;
      });

      return list;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载商品列表失败";
      setError(msg);
      setItems([]);
      return [];
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const loadRowsOnly = useCallback(async (currentItems: Item[]) => {
    setLoadingRows(true);
    setError(null);

    try {
      const ids = currentItems.map((x) => x.id).filter((x) => x > 0);
      if (ids.length === 0) {
        setRows([]);
        return;
      }

      const nextRows = await fetchItemUomRowsByItems(ids);
      setRows(sortGlobalBarcodeRows(nextRows));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载条码列表失败";
      setError(msg);
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, []);

  const reloadAll = useCallback(async () => {
    const list = await loadItemsOnly();
    await loadRowsOnly(list);
  }, [loadItemsOnly, loadRowsOnly]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    if (editingRow && editingRow.item_id !== selectedItemId) {
      setEditingRow(null);
    }
  }, [editingRow, selectedItemId]);

  const handleProbeBarcodeInput = useCallback(
    async (inputBarcode: string) => {
      const code = inputBarcode.trim();
      if (!code) return;

      const resp = await probeItemBarcode(code);

      const itemId =
        resp.status === "BOUND" && resp.item_id && resp.item_id > 0
          ? resp.item_id
          : null;

      if (itemId) {
        const target = items.find((x) => x.id === itemId) ?? null;
        if (target) {
          setSelectedItemId(target.id);
          setEditingRow(null);
          setPendingBarcode(null);
          setBarcodeHint(
            `已按条码 ${code} 自动定位商品，可继续维护包装并绑定条码。`,
          );
        } else {
          setPendingBarcode(null);
          setBarcodeHint(
            `条码 ${code} 已绑定商品，但当前列表中未找到该商品，请刷新后重试。`,
          );
        }
        return;
      }

      setPendingBarcode(code);
      setBarcodeHint(
        `条码 ${code} 尚未绑定商品。请先选择商品，系统会把该条码自动带入上方条码绑定卡。`,
      );
    },
    [items],
  );

  useEffect(() => {
    const barcode = barcodeFromQuery;
    if (!barcode) {
      setBarcodeHint(null);
      setPendingBarcode(null);
      return;
    }

    if (items.length === 0) return;

    let cancelled = false;

    async function resolveByProbe(inputBarcode: string) {
      try {
        await handleProbeBarcodeInput(inputBarcode);
      } catch {
        if (cancelled) return;
        setPendingBarcode(inputBarcode);
        setBarcodeHint(
          `条码 ${inputBarcode} 解析失败。请先选择商品，再在上方条码绑定卡里手动完成绑定。`,
        );
      }
    }

    void resolveByProbe(barcode);

    return () => {
      cancelled = true;
    };
  }, [barcodeFromQuery, items, handleProbeBarcodeInput]);

  const clearPendingBarcode = useCallback(() => {
    setPendingBarcode(null);
  }, []);

  const handleSelectItemId = useCallback((nextItemId: number | null) => {
    setSelectedItemId(nextItemId);
    setEditingRow(null);
  }, []);

  const handleModify = useCallback((row: ItemBarcodeCompositeRow) => {
    const packageName = rowDisplayName(row);
    const hasBoundBarcode = row.barcode_id > 0 && row.barcode.trim().length > 0;

    setSelectedItemId(row.item_id);
    setEditingRow(
      hasBoundBarcode
        ? row
        : {
            ...row,
            barcode_id: 0,
            barcode: "",
            symbology: "",
            is_primary: false,
            active: true,
            updated_at: "",
          },
    );

    setBarcodeHint(
      hasBoundBarcode
        ? `已将 ${row.sku} / ${row.item_name} / ${packageName} 回填到上方输入区，可直接修改。`
        : `已将 ${row.sku} / ${row.item_name} / ${packageName} 回填到上方输入区。当前包装还未绑定条码，请在上方按新建绑定完成保存。`,
    );
  }, []);

  const handlePackagingChanged = useCallback(async () => {
    setReloadToken((v) => v + 1);
    await loadRowsOnly(items);
  }, [items, loadRowsOnly]);

  const handleBarcodesSaved = useCallback(async () => {
    await loadRowsOnly(items);
  }, [items, loadRowsOnly]);

  const clearEditingRow = useCallback(() => {
    setEditingRow(null);
  }, []);

  return {
    items,
    loadingItems,
    loadingRows,
    error,

    keyword,
    setKeyword,

    filteredItems,
    selectedItemId,
    selectedItem,
    handleSelectItemId,

    barcodeHint,
    pendingBarcode,
    clearPendingBarcode,

    rows,
    editingRow,
    reloadToken,

    reloadAll,
    handleModify,
    handlePackagingChanged,
    handleBarcodesSaved,
    clearEditingRow,
    handleProbeBarcodeInput,
  };
}
