// src/features/pms/items/pages/ItemsPage.tsx
//
// 商品主数据首页（商品本体主数据页）
//
// - 顶部：页面说明
// - 下部：新建/编辑商品表单
// - 底部：商品列表
//
// 收敛规则（硬）：
// - 商品页只管商品本体主数据，不再承担条码治理职责。
// - 不保留 StatsCards / 主条码覆盖率统计。
// - URL 入口：/items?barcode=xxx 仅保留“已绑定条码自动定位商品”。
// - 若条码未绑定 / 解析失败：本页不承接绑定，不跳转旧入口。

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { probeItemBarcode } from "../../../../domains/pms/public/barcodeProbeClient";
import { useItemsStore } from "../model/itemsStore";
import ItemsFormSection from "../components/ItemsFormSection";

import { ItemsListCard } from "./sections/ItemsListCard";

const EDITOR_ANCHOR_ID = "items-editor";

const ItemsPage: React.FC = () => {
  const location = useLocation();

  const items = useItemsStore((s) => s.items);
  const error = useItemsStore((s) => s.error);

  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const filter = useItemsStore((s) => s.filter);

  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);
  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setFilter = useItemsStore((s) => s.setFilter);
  const loadItems = useItemsStore((s) => s.loadItems);

  const gotoEditor = () => {
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // --- 1. 从 URL 读取 ?barcode=xxx，写入 scannedBarcode ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bc = params.get("barcode");
    if (bc && bc.trim()) {
      setScannedBarcode(bc.trim());
    } else {
      setScannedBarcode(null);
    }
  }, [location.search, setScannedBarcode]);

  // --- 2. 首次加载商品 ---
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // --- 3. 若 URL/外部带入条码：仅保留“已绑定条码自动定位商品”
  useEffect(() => {
    if (!scannedBarcode) return;

    let cancelled = false;

    async function resolveByProbe() {
      const code = scannedBarcode;
      if (!code) return;

      try {
        const resp = await probeItemBarcode(code);
        if (cancelled) return;

        const itemId =
          resp.status === "BOUND" && resp.item_id && resp.item_id > 0
            ? resp.item_id
            : null;

        if (!itemId) return;

        const target = items.find((it) => it.id === itemId);
        if (!target) return;

        setSelectedItem(target);
        gotoEditor();
      } catch {
        if (cancelled) return;
      }
    }

    void resolveByProbe();

    return () => {
      cancelled = true;
    };
  }, [scannedBarcode, items, setSelectedItem]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品主数据（Items）</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> / <span className="font-mono">sku</span>。
          商品新建必须绑定供货商（必选），否则无法创建。本页只维护商品本体主数据；
          条码、箱码、包装单位、单位换算不再由本页治理。
          当前 <span className="font-mono">/items?barcode=xxx</span> 只保留已绑定条码自动定位商品。
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
