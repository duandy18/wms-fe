// src/features/admin/items/page/components/ItemsListCard.tsx

import React from "react";
import { UI } from "../ui";
import { ItemsTable } from "../../ItemsTable";

export const ItemsListCard: React.FC<{
  filter: "all" | "enabled" | "disabled";
  onSetFilter: (v: "all" | "enabled" | "disabled") => void;
}> = ({ filter, onSetFilter }) => {
  return (
    <section className={UI.card}>
      <div className={UI.listHeaderRow}>
        <h2 className={UI.h2}>商品列表</h2>

        <div className={UI.filterRow}>
          <span>状态筛选：</span>
          <button
            type="button"
            className={`${UI.filterBtnBase} ${filter === "all" ? UI.filterBtnOn : UI.filterBtnIdle}`}
            onClick={() => onSetFilter("all")}
          >
            全部
          </button>
          <button
            type="button"
            className={`${UI.filterBtnBase} ${filter === "enabled" ? UI.filterBtnEnabledOn : UI.filterBtnIdle}`}
            onClick={() => onSetFilter("enabled")}
          >
            仅启用
          </button>
          <button
            type="button"
            className={`${UI.filterBtnBase} ${filter === "disabled" ? UI.filterBtnDisabledOn : UI.filterBtnIdle}`}
            onClick={() => onSetFilter("disabled")}
          >
            仅停用
          </button>
        </div>
      </div>

      <ItemsTable />
    </section>
  );
};

export default ItemsListCard;
