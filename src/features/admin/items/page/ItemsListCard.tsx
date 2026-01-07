// src/features/admin/items/page/ItemsListCard.tsx

import React from "react";
import { ItemsTable } from "../ItemsTable";

export const ItemsListCard: React.FC<{
  filter: "all" | "enabled" | "disabled";
  onChangeFilter: (v: "all" | "enabled" | "disabled") => void;
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
              有效
            </button>
            <button
              type="button"
              className={clsDisabled}
              onClick={() => onChangeFilter("disabled")}
            >
              无效
            </button>
          </div>
        </div>
      </div>

      <ItemsTable />
    </section>
  );
};

export default ItemsListCard;
