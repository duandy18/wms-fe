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

export function useWarehousesListPresenter() {
  // 当前阶段：只区分“已登录 / 未登录”，暂不做细粒度权限控制
  const { isAuthenticated } = useAuth();

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建表单状态
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // 排序 & 过滤
  const [sortKey, setSortKey] = useState<WarehouseSortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // 权限：登录即可读写仓库配置
  const canRead = isAuthenticated;
  const canWrite = isAuthenticated;

  // ---------------------------------------------------------------------
  // 加载仓库
  // ---------------------------------------------------------------------
  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWarehouses(); // { ok, data }
      setWarehouses(res.data);
    } catch (err: any) {
      setError(err?.message ?? "加载仓库列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  // ---------------------------------------------------------------------
  // 切换 active 状态
  // ---------------------------------------------------------------------
  async function handleToggleActive(wh: WarehouseListItem) {
    if (!canWrite) return;

    setSaving(true);
    setError(null);

    try {
      const nextActive = !wh.active;

      await updateWarehouse(wh.id, { active: nextActive });

      // 如果切到 inactive，自动打开“显示停用”
      if (!nextActive) setShowInactive(true);

      await load();
    } catch (err: any) {
      setError(err?.message ?? "更新仓库状态失败");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------
  // 创建仓库
  // ---------------------------------------------------------------------
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
    } catch (err: any) {
      setError(err?.message ?? "创建仓库失败");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------
  // 排序（id / name / code）
  // ---------------------------------------------------------------------
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
      let av: string | number = a[sortKey] ?? "";
      let bv: string | number = b[sortKey] ?? "";

      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }

      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa === sb) return 0;
      return sortAsc ? (sa > sb ? 1 : -1) : (sa > sb ? -1 : 1);
    });
    return arr;
  }, [warehouses, sortKey, sortAsc]);

  const visibleWarehouses = useMemo(() => {
    return showInactive
      ? sortedWarehouses
      : sortedWarehouses.filter((w) => w.active);
  }, [sortedWarehouses, showInactive]);

  return {
    // 权限
    canRead,
    canWrite,

    // 加载 & 提交状态
    loading,
    saving,
    error,

    // 创建表单
    name,
    code,
    setName,
    setCode,
    handleCreate,

    // 列表 & 排序 & 过滤
    visibleWarehouses,
    showInactive,
    setShowInactive,
    sortKey,
    sortAsc,
    handleSort,

    // 行级操作
    handleToggleActive,
  };
}
