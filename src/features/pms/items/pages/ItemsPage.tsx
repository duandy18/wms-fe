// src/features/pms/items/ItemsPage.tsx
//
// 商品主数据首页（列表上方，编辑器中治理到底）
//
// - 顶部：主条码覆盖率统计
// - 下部：新建商品表单（编辑器）
// - 底部：商品列表
//
// 收敛规则（硬）：
// - 取消 Items 页“扫码工作台 UI”（不展示扫码台/最近记录/条码体检区）。
// - 取消底部 ItemBarcodesPanel（不再提供第二套条码管理入口）。
// - 条码治理唯一入口：编辑器 edit mode 的 BarcodeSection（ItemBarcodesSection）。
// - URL 入口：/items?barcode=xxx：
//   - 通过 PMS public barcode probe 解析条码；
//   - 若条码唯一绑定 → 自动选中商品并滚到编辑器；
//   - 若未绑定 → 保持 create mode，交给编辑器（create）去回填主条码。

import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { probeItemBarcode } from "../../../../domains/pms/public/barcodeProbeClient";
import { useItemsStore } from "../model/itemsStore";
import ItemsFormSection from "../components/ItemsFormSection";

import type { ItemsStats } from "./types";
import { StatsCards } from "./sections/StatsCards";
import { ItemsListCard } from "./sections/ItemsListCard";

const EDITOR_ANCHOR_ID = "items-editor";

const ItemsPage: React.FC = () => {
  const location = useLocation();

  const items = useItemsStore((s) => s.items);
  const error = useItemsStore((s) => s.error);

  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);
  const primaryBarcodes = useItemsStore((s) => s.primaryBarcodes);
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

  // --- 2. 首次加载商品 + 条码绑定信息 ---
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // --- 3. 若 URL/外部带入条码：改走 PMS public barcode probe
  // 规则：
  // - BOUND：按解析到的 item_id 自动选中商品并滚到编辑器
  // - UNBOUND / ERROR：保持 create mode，滚到编辑器，由编辑器继续承接
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

        if (!itemId) {
          gotoEditor();
          return;
        }

        const target = items.find((it) => it.id === itemId);
        if (!target) return;

        setSelectedItem(target);
        gotoEditor();
      } catch {
        if (cancelled) return;
        gotoEditor();
      }
    }

    void resolveByProbe();

    return () => {
      cancelled = true;
    };
  }, [scannedBarcode, items, setSelectedItem]);

  // --- 4. 顶部主条码覆盖率统计 ---
  const stats: ItemsStats = useMemo(() => {
    const total = items.length;
    const withPrimary = Object.keys(primaryBarcodes).length;
    return {
      total,
      withPrimary,
      withoutPrimary: total - withPrimary,
    };
  }, [items, primaryBarcodes]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品主数据（Items）</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> / <span className="font-mono">sku</span>。
          商品新建必须绑定供货商（必选），否则无法创建。条码治理收敛到编辑器内完成（唯一入口）。
        </p>
      </header>

      <StatsCards stats={stats} />

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
