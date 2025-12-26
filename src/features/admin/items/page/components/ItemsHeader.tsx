// src/features/admin/items/page/components/ItemsHeader.tsx

import React from "react";
import { UI } from "../ui";

export const ItemsHeader: React.FC = () => {
  return (
    <header>
      <h1 className={UI.headerTitle}>商品主数据（Items）</h1>
      <p className={UI.headerDesc}>
        Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认 <span className={UI.mono}>item_id</span> /{" "}
        <span className={UI.mono}>sku</span>。条码管理必须在这里维护完整，仓库作业区只负责扫描执行，不再判断商品。
      </p>
    </header>
  );
};

export default ItemsHeader;
