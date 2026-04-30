import React, { useEffect } from "react";
import { useItemsStore } from "../model/itemsStore";
import ItemsFormSection from "../components/ItemsFormSection";
import { ItemsListCard } from "./sections/ItemsListCard";

const ItemsPage: React.FC = () => {
  const error = useItemsStore((s) => s.error);
  const filter = useItemsStore((s) => s.filter);

  const setFilter = useItemsStore((s) => s.setFilter);
  const loadItems = useItemsStore((s) => s.loadItems);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品主数据（Items）</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> / <span className="font-mono">sku</span>。
          商品列表直接消费后端商品列表读模型；包装、条码、SKU 编码、属性等摘要由后端统一聚合。
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <ItemsFormSection />

      <ItemsListCard filter={filter} onChangeFilter={setFilter} />
    </div>
  );
};

export default ItemsPage;
