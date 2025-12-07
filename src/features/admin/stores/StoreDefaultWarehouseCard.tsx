// src/features/admin/stores/StoreDefaultWarehouseCard.tsx

import React from "react";
import type { StoreBinding } from "./types";

type Props = {
  defaultWarehouseId: number | null;
  bindings: StoreBinding[];
};

export const StoreDefaultWarehouseCard: React.FC<Props> = ({
  defaultWarehouseId,
  bindings,
}) => {
  // 根据 defaultWarehouseId 从绑定列表中找出对应仓库
  const binding = defaultWarehouseId
    ? bindings.find((b) => b.warehouse_id === defaultWarehouseId)
    : undefined;

  const warehouseLabel =
    binding &&
    [
      `WH-${binding.warehouse_id}`,
      binding.warehouse_name ? `· ${binding.warehouse_name}` : "",
      binding.warehouse_code ? `（${binding.warehouse_code}）` : "",
    ]
      .filter(Boolean)
      .join(" ");

  const active = binding?.warehouse_active;
  const isActive =
    active === undefined || active === null ? true : Boolean(active);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div className="text-base font-semibold text-slate-900">
        默认仓信息
      </div>

      {defaultWarehouseId == null ? (
        <div className="text-sm text-slate-500">尚未设置默认仓。</div>
      ) : binding ? (
        <div className="flex flex-col gap-1 text-sm text-slate-700">
          <div>
            默认仓：
            <span className="font-medium">{warehouseLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              仓库 ID: {binding.warehouse_id}
            </span>
            <span
              className={
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs border " +
                (isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200")
              }
            >
              {isActive ? "仓库已启用" : "仓库已停用"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-600">
          默认仓 ID：
          <span className="font-medium">{defaultWarehouseId}</span>
          <span className="text-xs text-slate-500 ml-2">
            （当前绑定列表中未找到该仓库）
          </span>
        </div>
      )}
    </section>
  );
};
