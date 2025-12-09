// src/features/admin/warehouses/useWarehousesListPresenter.ts

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/auth/useAuth";
import {
  fetchWarehouses,
  updateWarehouse,
  createWarehouse,
} from "./api";
import type { WarehouseListItem } from "./types";

export type WarehouseSortKey = "id" | "name" | "code";

type ApiErrorShape = {
  message?: string;
};

export function useWarehousesListPresenter() {
  const { isAuthenticated } = useAuth();

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [sortKey, setSortKey] = useState<WarehouseSortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const canRead = isAuthenticated;
  const canWrite = isAuthenticated;

  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWarehouses();
      setWarehouses(res.data);
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "加载仓库列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  async function handleToggleActive(wh: WarehouseListItem) {
    if (!canWrite) return;

    setSaving(true);
    setError(null);

    try {
      const nextActive = !wh.active;
      await updateWarehouse(wh.id, { active: nextActive });

      if (!nextActive) setShowInactive(true);

      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "更新仓库状态失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("仓库名称不能为空");
      return;
    }
    if (!canWrite) {
      setError("当前用户没有创建仓库的权限。");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createWarehouse({
        name: name.trim(),
        code: code.trim() || null,
      });

      setName("");
      setCode("");

      await load();
    } catch (err: unknown) {
      const e = err as ApiErrorShape | undefined;
      setError(e?.message ?? "创建仓库失败");
    } finally {
      setSaving(false);
    }
  }

  function handleSort(key: WarehouseSortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sortedWarehouses = useMemo(() => {
    const arr = [...warehouses];
    arr.sort((a, b) => {
      const av: string | number = a[sortKey] ?? "";
      const bv: string | number = b[sortKey] ?? "";

      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }

      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa === sb) return 0;
      return sortAsc ? (sa > sb ? 1 : -1) : sa > sb ? -1 : 1;
    });
    return arr;
  }, [warehouses, sortKey, sortAsc]);

  const visibleWarehouses = useMemo(
    () =>
      showInactive
        ? sortedWarehouses
        : sortedWarehouses.filter((w) => w.active),
    [sortedWarehouses, showInactive],
  );

  return {
    canRead,
    canWrite,

    loading,
    saving,
    error,

    name,
    code,
    setName,
    setCode,
    handleCreate,

    visibleWarehouses,
    showInactive,
    setShowInactive,
    sortKey,
    sortAsc,
    handleSort,

    handleToggleActive,
  };
}
