// src/features/admin/items/page/components/ItemBarcodesCard.tsx

import React from "react";
import { UI } from "../ui";
import { ItemBarcodesPanel } from "../../ItemBarcodesPanel";

export const ItemBarcodesCard: React.FC = () => {
  return (
    <section className={UI.card}>
      <h2 className={UI.h2}>当前商品的条码管理</h2>
      <p className={UI.mutedText}>
        在上方商品列表中点击「管理条码」，或在顶部扫描条码并手动选择商品，然后在这里维护主条码和次条码。
      </p>
      <ItemBarcodesPanel />
    </section>
  );
};

export default ItemBarcodesCard;
