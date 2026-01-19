// src/features/admin/stores/StoreProvinceRoutesCard.tsx
import React, { useEffect, useMemo, useState } from "react";

import { fetchActiveWarehouses } from "../warehouses/api";
import type { WarehouseListItem } from "../warehouses/types";

import {
  createProvinceRoute,
  deleteProvinceRoute,
  fetchProvinceRoutes,
  updateProvinceRoute,
  type ProvinceRouteItem,
} from "./api";

const PROVINCE_HINT = "使用订单收件省（中文），例如：广东省 / 北京市";

export const StoreProvinceRoutesCard: React.FC<{
  storeId: number;
  canWrite: boolean;
  allowedWarehouseIds: number[]; // ✅ 由父组件提供：该店铺已绑定仓
}> = ({ storeId, canWrite, allowedWarehouseIds }) => {
  const [rows, setRows] = useState<ProvinceRouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const whMap = useMemo(() => new Map(warehouses.map((w) => [w.id, w])), [warehouses]);

  const allowedSet = useMemo(() => new Set(allowedWarehouseIds), [allowedWarehouseIds]);

  const allowedWarehouses = useMemo(() => {
    return warehouses.filter((w) => allowedSet.has(w.id));
  }, [warehouses, allowedSet]);

  // 新增表单
  const [province, setProvince] = useState("");
  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [priority, setPriority] = useState(1);
  const [active, setActive] = useState(true);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const [rs, whs] = await Promise.all([fetchProvinceRoutes(storeId), fetchActiveWarehouses()]);
      setRows(rs);
      setWarehouses(whs);
    } catch (e: unknown) {
      console.error("load province routes failed", e);
      setErr(e instanceof Error ? e.message : "加载省级路由失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const hasBindings = allowedWarehouseIds.length > 0;
  const canCreate = canWrite && hasBindings && !loading;

  async function handleCreate() {
    if (!canWrite) return;

    if (!hasBindings) {
      setErr("该店铺尚未绑定任何仓库：无法新增省级分仓规则。请先绑定仓库。");
      return;
    }

    const p = province.trim();
    if (!p) {
      setErr("省不能为空（例如：广东省）");
      return;
    }
    if (!warehouseId) {
      setErr("请选择仓库");
      return;
    }
    if (!allowedSet.has(Number(warehouseId))) {
      setErr("所选仓库不属于该店铺的绑定仓，请先完成仓库绑定后再设置省级分仓规则。");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      await createProvinceRoute(storeId, {
        province: p,
        warehouse_id: Number(warehouseId),
        priority: Number(priority) || 1,
        active,
      });
      await reload();
      setProvince("");
      setWarehouseId("");
      setPriority(1);
      setActive(true);
    } catch (e: unknown) {
      console.error("create route failed", e);
      setErr(e instanceof Error ? e.message : "新增省级路由失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(r: ProvinceRouteItem) {
    if (!canWrite) return;
    setLoading(true);
    setErr(null);
    try {
      await updateProvinceRoute(storeId, r.id, { active: !r.active });
      await reload();
    } catch (e: unknown) {
      console.error("toggle active failed", e);
      setErr(e instanceof Error ? e.message : "更新省级路由失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(r: ProvinceRouteItem) {
    if (!canWrite) return;
    const ok = window.confirm(`确认删除省级路由：${r.province} / priority=${r.priority} ?`);
    if (!ok) return;

    setLoading(true);
    setErr(null);
    try {
      await deleteProvinceRoute(storeId, r.id);
      await reload();
    } catch (e: unknown) {
      console.error("delete route failed", e);
      setErr(e instanceof Error ? e.message : "删除省级路由失败");
    } finally {
      setLoading(false);
    }
  }

  // 展示：优先级高的靠前，同优先级按省名
  const displayRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.province.localeCompare(b.province, "zh");
    });
  }, [rows]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-slate-900">省级分仓规则</div>
          <div className="mt-1 text-xs text-slate-500">{PROVINCE_HINT}</div>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="text-[11px] px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}

      {!hasBindings ? (
        <div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          该店铺尚未绑定任何仓库：省级分仓规则暂不可新增。请先完成“仓库策略”配置。
        </div>
      ) : null}

      {/* 新增规则 */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500">省</div>
          <input
            className="h-9 w-40 rounded border border-slate-300 px-2 text-sm"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="例如：广东省"
            disabled={!canWrite || loading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500">仓库</div>
          <select
            className="h-9 w-64 rounded border border-slate-300 bg-white px-2 text-sm"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
            disabled={!canWrite || loading || !hasBindings}
          >
            <option value="">请选择仓库（必须已绑定到店铺）</option>
            {allowedWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}（#{w.id}{w.code ? ` · ${w.code}` : ""}）
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500">优先级</div>
          <input
            className="h-9 w-24 rounded border border-slate-300 px-2 text-sm"
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value || "1") || 1)}
            disabled={!canWrite || loading}
          />
        </div>

        <label className="inline-flex items-center gap-2 pb-1 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={!canWrite || loading}
          />
          启用
        </label>

        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={!canCreate}
          className="h-9 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
          title={!hasBindings ? "请先绑定仓库" : undefined}
        >
          新增规则
        </button>
      </div>

      {/* 列表 */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-[12px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">省</th>
              <th className="px-3 py-2 text-right">优先级</th>
              <th className="px-3 py-2 text-left">仓库</th>
              <th className="px-3 py-2 text-left">启用</th>
              <th className="px-3 py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>
                  暂无省级路由规则（会走默认兜底仓或人工强制）。
                </td>
              </tr>
            ) : (
              displayRows.map((r) => {
                const wh = whMap.get(r.warehouse_id);
                const whLabel = wh
                  ? `${wh.name}（#${wh.id}${wh.code ? ` · ${wh.code}` : ""}）`
                  : `#${r.warehouse_id}`;
                const whBound = allowedSet.has(r.warehouse_id);

                return (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{r.province}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.priority}</td>
                    <td className="px-3 py-2">
                      {whLabel}
                      {!whBound ? (
                        <span className="ml-2 text-[11px] text-rose-700">（该仓未绑定到店铺）</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <span className={r.active ? "text-emerald-700" : "text-slate-500"}>
                        {r.active ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(r)}
                          disabled={!canWrite || loading}
                          className="rounded border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-50 disabled:opacity-60"
                        >
                          {r.active ? "停用" : "启用"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(r)}
                          disabled={!canWrite || loading}
                          className="rounded border border-rose-200 px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
