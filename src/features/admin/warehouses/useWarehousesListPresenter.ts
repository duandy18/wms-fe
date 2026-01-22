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
  fetchWarehouseShippingProviders,
} from "./api";
import type {
  WarehouseListItem,
  WarehouseServiceProvinceOccupancyOut,
  WarehouseServiceCityOccupancyOut,
  WarehouseServiceCitySplitProvincesOut,
  WarehouseShippingProviderListItem,
} from "./types";
import { CN_PROVINCES } from "./detail/provinces";
import { deriveWarehouseCoverage, type FulfillmentCoverage } from "./fulfillment/deriveWarehouseCoverage";
// CI-FINGERPRINT: route-c-coverage-import=fulfillment

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

// ✅ 仍然对外导出，给 table 使用
export type { FulfillmentCoverage };

type ActiveCarrierSummary = {
  labels: string[]; // e.g. ["JT", "DATONG"]
  total: number; // active carrier count
};

function carrierLabelFromBinding(x: WarehouseShippingProviderListItem): string {
  const code = x.provider?.code ? String(x.provider.code).trim() : "";
  const name = x.provider?.name ? String(x.provider.name).trim() : "";
  return code || name || "—";
}

function summarizeActiveCarriers(list: WarehouseShippingProviderListItem[]): ActiveCarrierSummary {
  // 事实口径：必须“具备服务资格”且“正在服务”
  const active = (list || []).filter((x) => x.active === true && x.provider?.active === true);

  // 去重：按 label
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const x of active) {
    const label = carrierLabelFromBinding(x);
    if (!label || label === "—") continue;
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }

  labels.sort((a, b) => a.localeCompare(b, "zh"));

  return { labels, total: labels.length };
}

export function useWarehousesListPresenter() {
  const { isAuthenticated, can } = useAuth();

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

  // ✅ 合同口径：
  // - 读：只要登录即可读（现有系统就是这么跑的）
  // - 写：必须具备 config.store.write（与 Sidebar/menuConfig/仓库详情/新建页保持一致）
  const canRead = isAuthenticated;
  const canWrite = can("config.store.write");

  const [coverageById, setCoverageById] = useState<Record<number, FulfillmentCoverage>>({});
  const [fulfillmentWarning, setFulfillmentWarning] = useState<string | null>(null);

  // ✅ 新增：每个仓库“正在服务”的快递公司汇总（事实展示）
  const [activeCarriersByWarehouseId, setActiveCarriersByWarehouseId] = useState<Record<number, ActiveCarrierSummary>>(
    {},
  );

  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWarehouses();
      const list = res.data ?? [];
      setWarehouses(list);

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

      const derived = deriveWarehouseCoverage({
        warehouses: list,
        provincesUniverseN: CN_PROVINCES.length,
        provOcc,
        cityOcc,
        split,
      });

      setCoverageById(derived.coverageById);
      setFulfillmentWarning(derived.warning);

      // ✅ 并行拉取每个仓库的服务资格，并汇总“正在服务”
      try {
        const pairs: Array<[number, ActiveCarrierSummary]> = await Promise.all(
          list.map(async (w) => {
            try {
              const bindings = await fetchWarehouseShippingProviders(w.id);
              return [w.id, summarizeActiveCarriers(bindings)] as [number, ActiveCarrierSummary];
            } catch (e) {
              console.warn("fetchWarehouseShippingProviders failed", w.id, e);
              return [w.id, { labels: [], total: 0 }] as [number, ActiveCarrierSummary];
            }
          }),
        );

        const m: Record<number, ActiveCarrierSummary> = {};
        for (const [wid, summary] of pairs) m[wid] = summary;
        setActiveCarriersByWarehouseId(m);
      } catch (e) {
        console.warn("load active carriers summary failed", e);
        setActiveCarriersByWarehouseId({});
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
    if (!canWrite) {
      setError("当前账号无写权限（config.store.write），不能更新仓库状态。");
      return;
    }
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
    if (!canWrite) return setError("当前账号无写权限（config.store.write），不能创建仓库。");

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

    activeCarriersByWarehouseId,

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
