// src/features/admin/stores/StoreBindWarehouseForm.tsx

import React, { useEffect, useState } from "react";
import { fetchActiveWarehouses } from "../warehouses/api";
import type { WarehouseListItem } from "../warehouses/types";
import type { WarehouseRole } from "./types";

type Props = {
  canWrite: boolean;
  saving: boolean;
  onSubmit: (p: {
    warehouseId: number;
    role: WarehouseRole;
    priority: number;
  }) => void;
};

const roleOptions: Array<{ value: WarehouseRole; label: string; hint: string }> = [
  { value: "NORMAL", label: "普通仓", hint: "仅绑定：规则命中时使用，不优先、不兜底" },
  { value: "TOP", label: "主仓（TOP）", hint: "优先倾向：可多主仓，priority 决定顺序" },
  { value: "DEFAULT", label: "默认兜底仓", hint: "FALLBACK 下未命中规则时使用（只能有一个）" },
];

export const StoreBindWarehouseForm: React.FC<Props> = ({ canWrite, saving, onSubmit }) => {
  // ===== 所有 Hook 必须无条件执行 =====
  const [warehouseId, setWarehouseId] = useState("");
  const [role, setRole] = useState<WarehouseRole>("NORMAL");
  const [priority, setPriority] = useState(100);

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ===== 加载可用仓库列表 =====
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingWarehouses(true);
      setLoadError(null);

      try {
        const items = await fetchActiveWarehouses();
        if (!cancelled) setWarehouses(items);
      } catch {
        if (!cancelled) setLoadError("加载仓库列表失败，请稍后重试");
      } finally {
        if (!cancelled) setLoadingWarehouses(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Hook 全部执行完毕后，再根据 canWrite 决定是否渲染 =====
  if (!canWrite) return null;

  const roleHint = roleOptions.find((x) => x.value === role)?.hint ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wid = Number(warehouseId);
    if (!wid || wid <= 0) return;

    onSubmit({
      warehouseId: wid,
      role,
      priority,
    });

    // 重置表单
    setWarehouseId("");
    setRole("NORMAL");
    setPriority(100);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="text-base font-semibold text-slate-900">新增仓库绑定</div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end text-sm">
        {/* 仓库选择 */}
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">选择仓库</span>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="border rounded px-3 py-2 text-base w-64"
            disabled={loadingWarehouses || saving || warehouses.length === 0}
          >
            <option value="">
              {loadingWarehouses
                ? "加载仓库列表中…"
                : warehouses.length === 0
                ? "暂无可用仓库"
                : "请选择仓库"}
            </option>

            {warehouses.map((wh) => {
              const idLabel = `WH-${wh.id}`;
              const name = (wh.name || "").trim();
              const code = (wh.code || "").trim() || null;

              const displayName = name || code || idLabel;
              const prefix = displayName === idLabel ? "" : `${idLabel} · `;
              const suffix = code && code !== displayName ? `（${code}）` : "";

              return (
                <option key={wh.id} value={wh.id}>
                  {prefix}
                  {displayName}
                  {suffix}
                </option>
              );
            })}
          </select>

          {loadError && <span className="text-xs text-red-500 mt-1">{loadError}</span>}
        </label>

        {/* 角色 */}
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">仓库角色</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as WarehouseRole)}
            className="border rounded px-3 py-2 text-base w-64 bg-white"
            disabled={saving}
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">{roleHint}</span>
        </label>

        {/* 优先级 */}
        <label className="flex flex-col gap-1">
          <span className="text-slate-600">优先级</span>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 0)}
            className="border rounded px-3 py-2 text-base w-28"
            disabled={saving}
          />
        </label>

        {/* 提交 */}
        <button
          type="submit"
          disabled={saving || loadingWarehouses || warehouses.length === 0 || !warehouseId}
          className="px-5 py-2 rounded-lg bg-slate-900 text-white text-base font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "绑定中…" : "绑定"}
        </button>
      </form>
    </section>
  );
};
