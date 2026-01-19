// src/features/admin/stores/StoreDefaultWarehouseCard.tsx

import React, { useMemo, useState } from "react";
import type { StoreBinding } from "./types";

type Props = {
  defaultWarehouseId: number | null;
  bindings: StoreBinding[];
  canWrite: boolean;
  saving: boolean;
  onSetDefault: (warehouseId: number) => void;
};

export const StoreDefaultWarehouseCard: React.FC<Props> = ({
  defaultWarehouseId,
  bindings,
  canWrite,
  saving,
  onSetDefault,
}) => {
  const options = useMemo(() => {
    return (bindings ?? []).map((b) => {
      const label = [
        `WH-${b.warehouse_id}`,
        b.warehouse_name ? `· ${b.warehouse_name}` : "",
        b.warehouse_code ? `（${b.warehouse_code}）` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const isActive = b.warehouse_active === undefined || b.warehouse_active === null
        ? true
        : Boolean(b.warehouse_active);

      return {
        warehouse_id: b.warehouse_id,
        label: label || `WH-${b.warehouse_id}`,
        isActive,
      };
    });
  }, [bindings]);

  const [selectedId, setSelectedId] = useState<number | "">(defaultWarehouseId ?? "");

  // 如果默认仓变化（刷新详情后），同步下拉选中
  React.useEffect(() => {
    setSelectedId(defaultWarehouseId ?? "");
  }, [defaultWarehouseId]);

  const current =
    defaultWarehouseId != null ? options.find((x) => x.warehouse_id === defaultWarehouseId) : null;

  const selectedNum = selectedId === "" ? null : Number(selectedId);
  const selectedOpt = selectedNum != null ? options.find((x) => x.warehouse_id === selectedNum) : null;

  // 默认策略：不允许把“已停用仓”设为默认仓（避免落入不可履约/不可解释状态）
  const selectedIsInactive = selectedOpt ? !selectedOpt.isActive : false;

  const canSave =
    canWrite &&
    !saving &&
    selectedNum != null &&
    selectedNum !== defaultWarehouseId &&
    !selectedIsInactive;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="text-base font-semibold text-slate-900">默认仓</div>

      {options.length === 0 ? (
        <div className="text-sm text-slate-500">尚未绑定任何仓库，无法设置默认仓。</div>
      ) : (
        <>
          <div className="text-sm text-slate-700">
            当前默认仓：
            {defaultWarehouseId == null ? (
              <span className="ml-1 text-slate-500">（未设置）</span>
            ) : current ? (
              <span className="ml-1 font-medium">
                {current.label}
                <span className="ml-2 text-xs text-slate-500">
                  {current.isActive ? "启用" : "已停用"}
                </span>
                {!current.isActive ? (
                  <span className="ml-2 text-xs text-rose-700">
                    （默认仓已停用：建议尽快切换）
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="ml-1 font-medium">
                WH-{defaultWarehouseId}
                <span className="ml-2 text-xs text-slate-500">（绑定列表未找到）</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">选择默认仓</span>
              <select
                className="border rounded px-3 py-2 text-sm w-72 bg-white disabled:opacity-60"
                value={selectedId}
                disabled={!canWrite || saving}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedId(v ? Number(v) : "");
                }}
              >
                <option value="">请选择仓库</option>
                {options.map((o) => (
                  <option key={o.warehouse_id} value={o.warehouse_id}>
                    {o.label}
                    {o.isActive ? "" : "（已停用）"}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={!canSave}
              onClick={() => selectedNum != null && onSetDefault(selectedNum)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              title={selectedIsInactive ? "已停用仓不可设为默认仓" : undefined}
            >
              {saving ? "保存中…" : "设为默认仓"}
            </button>
          </div>

          {selectedIsInactive ? (
            <div className="text-xs text-rose-700">
              你选择的仓库已停用：不允许设为默认仓。请先启用仓库或选择其他仓。
            </div>
          ) : null}

          {!canWrite ? (
            <div className="text-xs text-slate-500">只读模式（无写权限）。</div>
          ) : null}
        </>
      )}
    </section>
  );
};
