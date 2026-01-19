// src/features/admin/stores/useStoresListPresenter.ts

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/useAuth";
import { fetchStores, updateStore, createStore } from "./api";
import type { StoreListItem } from "./types";

export type SortKey = "id" | "platform" | "shop_id" | "name";

type ApiErrorShape = {
  message?: string;
};

export function useStoresListPresenter() {
  const { isAuthenticated } = useAuth();

  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plat, setPlat] = useState("PDD");
  const [shopId, setShopId] = useState("");
  const [name, setName] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const [showInactive, setShowInactive] = useState(false);

  const canRead = isAuthenticated;
  const canWrite = isAuthenticated;

  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStores();
      setStores(res.data);
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载店铺列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  async function handleToggleActive(store: StoreListItem) {
    if (!canWrite) return;
    setSaving(true);
    setError(null);
    try {
      const willBeActive = !store.active;
      await updateStore(store.id, { active: willBeActive });

      if (!willBeActive) {
        setShowInactive(true);
      }

      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "更新店铺状态失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!plat.trim() || !shopId.trim()) {
      setError("platform / shop_id 不能为空");
      return;
    }
    if (!canWrite) {
      setError("当前用户没有创建店铺的权限。");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createStore({
        platform: plat.trim().toUpperCase(),
        shop_id: shopId.trim(),
        name: name || null,
      });
      setPlat("PDD");
      setShopId("");
      setName("");
      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "创建店铺失败");
    } finally {
      setSaving(false);
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sortedStores = useMemo(() => {
    const list = [...stores];
    list.sort((a, b) => {
      let av: string | number;
      let bv: string | number;

      switch (sortKey) {
        case "platform":
          av = a.platform;
          bv = b.platform;
          break;
        case "shop_id":
          av = a.shop_id;
          bv = b.shop_id;
          break;
        case "name":
          av = a.name;
          bv = b.name;
          break;
        case "id":
        default:
          av = a.id;
          bv = b.id;
          break;
      }

      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa === sb) return 0;
      const res = sa > sb ? 1 : -1;
      return sortAsc ? res : -res;
    });
    return list;
  }, [stores, sortKey, sortAsc]);

  const visibleStores = useMemo(
    () => (showInactive ? sortedStores : sortedStores.filter((s) => s.active)),
    [sortedStores, showInactive],
  );

  return {
    canRead,
    canWrite,
    loading,
    saving,
    error,

    plat,
    shopId,
    name,
    setPlat,
    setShopId,
    setName,
    handleCreate,

    visibleStores,
    showInactive,
    setShowInactive,
    sortKey,
    sortAsc,
    handleSort,

    handleToggleActive,
  };
}
