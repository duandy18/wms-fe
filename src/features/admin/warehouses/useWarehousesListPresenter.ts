// src/features/admin/warehouses/useWarehousesListPresenter.ts

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../shared/useAuth";
import {
  fetchWarehouses,
  updateWarehouse,
  createWarehouse,
  fetchWarehouseServiceProvinceOccupancy,
  fetchWarehouseServiceCityOccupancy,
  fetchWarehouseServiceCitySplitProvinces,
} from "./api";
import type {
  WarehouseListItem,
  WarehouseServiceProvinceOccupancyOut,
  WarehouseServiceCityOccupancyOut,
  WarehouseServiceCitySplitProvincesOut,
} from "./types";
import { CN_PROVINCES } from "./detail/provinces";

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

export type FulfillmentCoverage = {
  province_n: number;
  city_n: number;
  fulfill_label: "全国覆盖" | "可命中" | "对外不可命中";
};

function countByWarehouseId<T extends { warehouse_id: number }>(rows: T[]): Record<number, number> {
  const m: Record<number, number> = {};
  for (const r of rows || []) {
    const wid = Number(r.warehouse_id);
    if (!Number.isFinite(wid) || wid <= 0) continue;
    m[wid] = (m[wid] ?? 0) + 1;
  }
  return m;
}

export function useWarehousesListPresenter() {
  const { isAuthenticated } = useAuth();

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form fields（列表页不展示创建表单，但保留逻辑兼容）
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

  const [coverageById, setCoverageById] = useState<Record<number, FulfillmentCoverage>>({});
  const [fulfillmentWarning, setFulfillmentWarning] = useState<string | null>(null);

  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError(null);

    try {
      // 1) 主数据：仓库列表
      const res = await fetchWarehouses();
      const list = res.data ?? [];
      setWarehouses(list);

      // 2) 履约覆盖：并行读取 occupancy + split
      let provOcc: WarehouseServiceProvinceOccupancyOut | null = null;
      let cityOcc: WarehouseServiceCityOccupancyOut | null = null;
      let split: WarehouseServiceCitySplitProvincesOut | null = null;

      try {
        [provOcc, cityOcc, split] = await Promise.all([
          fetchWarehouseServiceProvinceOccupancy(),
          fetchWarehouseServiceCityOccupancy(),
          fetchWarehouseServiceCitySplitProvinces(),
        ]);
      } catch (e) {
        console.error("load fulfillment coverage failed", e);
      }

      const provCountByWid = countByWarehouseId(
        (provOcc?.rows ?? []).map((r) => ({ warehouse_id: r.warehouse_id })),
      );
      const cityCountByWidRaw = countByWarehouseId(
        (cityOcc?.rows ?? []).map((r) => ({ warehouse_id: r.warehouse_id })),
      );

      // ✅ 关键语义：只有当存在“按城市配置的省”时，城市规则才参与履约命中
      const splitCount = (split?.provinces ?? []).length;
      const cityRuleEnabled = splitCount > 0;

      const totalProvinces = CN_PROVINCES.length;
      const effectiveProvinceUniverse = Math.max(0, totalProvinces - splitCount);

      const cov: Record<number, FulfillmentCoverage> = {};
      for (const w of list) {
        const provN = provCountByWid[w.id] ?? 0;

        // ✅ 只在城市规则启用时展示/统计市，否则显示 0（避免误导）
        const cityN = cityRuleEnabled ? (cityCountByWidRaw[w.id] ?? 0) : 0;

        let label: FulfillmentCoverage["fulfill_label"] = "可命中";
        if (provN === 0 && cityN === 0) label = "对外不可命中";
        else if (provN >= effectiveProvinceUniverse && effectiveProvinceUniverse > 0) label = "全国覆盖";

        cov[w.id] = { province_n: provN, city_n: cityN, fulfill_label: label };
      }
      setCoverageById(cov);

      // 3) 全局风险提示：存在全国覆盖仓 + 还有其它运行中仓
      const activeWarehouses = list.filter((w) => !!w.active);
      const national = activeWarehouses.filter((w) => cov[w.id]?.fulfill_label === "全国覆盖");
      if (national.length > 0 && activeWarehouses.length > 1) {
        const names = national.map((w) => w.code || w.name || `#${w.id}`).join("、");
        setFulfillmentWarning(
          `当前存在“全国覆盖”的仓库：${names}。其它仓库即使处于运行中，也可能对外不可命中（除非按城市配置或调整省份覆盖）。`,
        );
      } else {
        setFulfillmentWarning(null);
      }
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

  const visibleWarehouses = useMemo(
    () => (showInactive ? sortedWarehouses : sortedWarehouses.filter((w) => w.active)),
    [sortedWarehouses, showInactive],
  );

  return {
    canRead,
    canWrite,
    loading,
    saving,
    error,

    coverageById,
    fulfillmentWarning,

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
