// src/features/admin/items/page/components/ItemsStatsGrid.tsx

import React from "react";
import { UI } from "../ui";

export const ItemsStatsGrid: React.FC<{
  total: number;
  withPrimary: number;
  withoutPrimary: number;
}> = ({ total, withPrimary, withoutPrimary }) => {
  return (
    <section className={UI.statsGrid}>
      <div className={UI.statCard}>
        <div className={UI.statLabel}>商品总数</div>
        <div className={UI.statValue}>{total}</div>
      </div>

      <div className={UI.statCardOk}>
        <div className={UI.statLabelOk}>已配置主条码</div>
        <div className={UI.statValueOk}>{withPrimary}</div>
      </div>

      <div className={UI.statCardWarn}>
        <div className={UI.statLabelWarn}>未配置主条码（入库时会失败）</div>
        <div className={UI.statValueWarn}>{withoutPrimary}</div>
      </div>
    </section>
  );
};

export default ItemsStatsGrid;
