// src/features/pms/items/page/ItemsListCard.tsx

import React from "react";
import { ItemsTable } from "../../components/ItemsTable";
import type { EnabledFilter } from "../../model/types";

export const ItemsListCard: React.FC<{
  filter: EnabledFilter;
  onChangeFilter: (v: EnabledFilter) => void;
}> = ({ filter, onChangeFilter }) => {
  const btnBase = "rounded px-2 py-1 border text-[11px] font-medium";

  const clsAll =
    btnBase +
    " " +
    (filter === "all"
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50");

  const clsEnabled =
    btnBase +
    " " +
    (filter === "enabled"
      ? "border-emerald-700 bg-emerald-700 text-white"
      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100");

  const clsDisabled =
    btnBase +
    " " +
    (filter === "disabled"
      ? "border-red-700 bg-red-700 text-white"
      : "border-red-300 bg-red-50 text-red-800 hover:bg-red-100");

  const clsIncomplete =
    btnBase +
    " " +
    (filter === "incomplete"
      ? "border-amber-700 bg-amber-700 text-white"
      : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100");

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">商品列表</h2>

        <div className="flex flex-col items-end gap-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span>状态筛选：</span>
            <button type="button" className={clsAll} onClick={() => onChangeFilter("all")}>
              全部
            </button>
            <button
              type="button"
              className={clsEnabled}
              onClick={() => onChangeFilter("enabled")}
            >
              启用
            </button>
            <button
              type="button"
              className={clsDisabled}
              onClick={() => onChangeFilter("disabled")}
            >
              停用
            </button>
            <button
              type="button"
              className={clsIncomplete}
              onClick={() => onChangeFilter("incomplete")}
            >
              待完善
            </button>
          </div>
        </div>
      </div>

      <ItemsTable />
    </section>
  );
};

export default ItemsListCard;
