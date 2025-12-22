// src/features/admin/warehouses/useWarehousesListPresenter.ts

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/useAuth";
import { fetchWarehouses, updateWarehouse, createWarehouse } from "./api";
import type { WarehouseListItem } from "./types";

export type WarehouseSortKey = "id" | "name" | "code";

type ApiErrorShape = { message?: string };
const errMsg = (e: unknown, fallback: string) => {
  const x = e as ApiErrorShape | undefined;
  return x?.message ?? fallback;
};

type CreateWarehousePayload = {
  name: string;
  code: string;
  active: boolean;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
};

function getSortValue(w: WarehouseListItem, key: WarehouseSortKey): string | number {
  if (key === "id") return w.id;
  if (key === "name") return w.name ?? "";
  return w.code ?? "";
}

export function useWarehousesListPresenter() {
  const { isAuthenticated } = useAuth();

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areaSqm, setAreaSqm] = useState("");

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
    } catch (e: unknown) {
      setError(errMsg(e, "加载仓库列表失败"));
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
    } catch (e: unknown) {
      setError(errMsg(e, "更新仓库状态失败"));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const n = name.trim();
    const c = code.trim();

    if (!n) return setError("仓库名称不能为空");
    if (!c) return setError("仓库编码不能为空（必填，手动输入，例如 SH-MAIN）");
    if (!canWrite) return setError("当前用户没有创建仓库的权限。");

    const addr = address.trim();
    const cn = contactName.trim();
    const cp = contactPhone.trim();

    let parsedArea: number | null = null;
    if (areaSqm.trim() !== "") {
      const num = Number(areaSqm.trim());
      if (!Number.isFinite(num) || num < 0) return setError("仓库面积必须是 >= 0 的数字");
      parsedArea = num;
    }

    const payload: CreateWarehousePayload = {
      name: n,
      code: c,
      active,
      address: addr ? addr : null,
      contact_name: cn ? cn : null,
      contact_phone: cp ? cp : null,
      area_sqm: parsedArea,
    };

    setSaving(true);
    setError(null);
    try {
      await createWarehouse(payload);
      setName("");
      setCode("");
      setActive(true);
      setAddress("");
      setContactName("");
      setContactPhone("");
      setAreaSqm("");
      await load();
    } catch (e: unknown) {
      const msg = errMsg(e, "创建仓库失败");
      if (msg.toLowerCase().includes("unique") || msg.includes("duplicate") || msg.includes("重复")) {
        setError("仓库名称或仓库编码已存在，请换一个再试。");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSort(key: WarehouseSortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sortedWarehouses = useMemo(() => {
    const arr = [...warehouses];
    arr.sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);

      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;

      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa === sb) return 0;
      return sortAsc ? (sa > sb ? 1 : -1) : sa > sb ? -1 : 1;
    });
    return arr;
  }, [warehouses, sortKey, sortAsc]);

  const visibleWarehouses = useMemo(() => (showInactive ? sortedWarehouses : sortedWarehouses.filter((w) => w.active)), [sortedWarehouses, showInactive]);

  return {
    canRead,
    canWrite,
    loading,
    saving,
    error,

    name,
    code,
    active,
    address,
    contactName,
    contactPhone,
    areaSqm,

    setName,
    setCode,
    setActive,
    setAddress,
    setContactName,
    setContactPhone,
    setAreaSqm,

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
