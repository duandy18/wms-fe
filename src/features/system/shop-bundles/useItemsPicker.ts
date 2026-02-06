// src/features/system/shop-bundles/useItemsPicker.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MasterItem } from "./types";
import { apiListItems } from "./itemsApi";

export type UseItemsPickerState = {
  items: MasterItem[];
  loading: boolean;
  error: string | null;

  query: string;
  setQuery: (v: string) => void;

  refresh: () => Promise<void>;
  filtered: MasterItem[];
};

export function useItemsPicker(): UseItemsPickerState {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 先用最小实现：拉一页 items；后续需要更强搜索再扩展
      const list = await apiListItems({ limit: 50, offset: 0 });
      setItems(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载商品主数据失败";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const hitSku = String(it.sku).toLowerCase().includes(q);
      const hitName = String(it.name).toLowerCase().includes(q);
      const hitBarcode = (it.barcode ?? "").toLowerCase().includes(q);
      const hitBrand = (it.brand ?? "").toLowerCase().includes(q);
      const hitId = String(it.id).includes(q);
      return hitSku || hitName || hitBarcode || hitBrand || hitId;
    });
  }, [items, query]);

  return useMemo(
    () => ({ items, loading, error, query, setQuery, refresh, filtered }),
    [items, loading, error, query, setQuery, refresh, filtered],
  );
}
