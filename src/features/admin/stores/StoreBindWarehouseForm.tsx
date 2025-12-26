// src/features/admin/stores/StoreBindWarehouseForm.tsx

import React, { useEffect, useState } from "react";
import { fetchActiveWarehouses } from "../warehouses/api";
import type { WarehouseListItem } from "../warehouses/types";
import { UI } from "./ui";

type Props = {
  canWrite: boolean;
  saving: boolean;
  onSubmit: (p: {
    warehouseId: number;
    isTop: boolean;
    priority: number;
  }) => void;
};

export const StoreBindWarehouseForm: React.FC<Props> = ({
  canWrite,
  saving,
  onSubmit,
}) => {
  // ===== 所有 Hook 必须无条件执行 =====
  const [warehouseId, setWarehouseId] = useState("");
  const [isTop, setIsTop] = useState(false);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wid = Number(warehouseId);
    if (!wid || wid <= 0) return;

    onSubmit({ warehouseId: wid, isTop, priority });

    // 重置表单
    setWarehouseId("");
    setIsTop(false);
    setPriority(100);
  }

  const selectDisabled = loadingWarehouses || saving || warehouses.length === 0;
  const submitDisabled =
    saving || loadingWarehouses || warehouses.length === 0 || !warehouseId;

  return (
    <section className={UI.cardP4}>
      <div className={UI.titleBase}>新增仓库绑定</div>

      <form onSubmit={handleSubmit} className={UI.formRowWrap}>
        {/* 仓库选择 */}
        <label className={UI.fieldCol}>
          <span className={UI.labelSm}>选择仓库</span>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className={UI.inputW64}
            disabled={selectDisabled}
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

          {loadError ? <span className={UI.inlineErr}>{loadError}</span> : null}
        </label>

        {/* 是否主仓 */}
        <label className={UI.checkboxRow}>
          <input
            type="checkbox"
            checked={isTop}
            onChange={(e) => setIsTop(e.target.checked)}
          />
          设为主仓（TOP 仓）
        </label>

        {/* 优先级 */}
        <label className={UI.fieldCol}>
          <span className={UI.labelSm}>优先级</span>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) || 0)}
            className={UI.inputW28}
          />
        </label>

        {/* 提交 */}
        <button
          type="submit"
          disabled={submitDisabled}
          className={UI.btnPrimaryHover}
        >
          {saving ? "绑定中…" : "绑定"}
        </button>
      </form>
    </section>
  );
};

export default StoreBindWarehouseForm;
