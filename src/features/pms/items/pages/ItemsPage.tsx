import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScanConsole } from "../../../../shared/scan/ui/ScanConsole";
import { probeItemBarcode } from "../../../../domains/pms/public/barcodeProbeClient";
import { useItemsStore } from "../model/itemsStore";
import ItemsFormSection from "../components/ItemsFormSection";
import { ItemsListCard } from "./sections/ItemsListCard";

const EDITOR_ANCHOR_ID = "items-editor";

const ItemsPage: React.FC = () => {
  const location = useLocation();

  const items = useItemsStore((s) => s.items);
  const error = useItemsStore((s) => s.error);
  const filter = useItemsStore((s) => s.filter);

  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setFilter = useItemsStore((s) => s.setFilter);
  const loadItems = useItemsStore((s) => s.loadItems);

  const [scanHint, setScanHint] = useState<string>("");

  const barcodeFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("barcode");
    return code && code.trim() ? code.trim() : null;
  }, [location.search]);

  const gotoEditor = () => {
    const el = document.getElementById(EDITOR_ANCHOR_ID);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function locateItemByBarcode(codeRaw: string): Promise<void> {
    const code = codeRaw.trim();
    if (!code) return;

    const resp = await probeItemBarcode(code);

    const itemId =
      resp.status === "BOUND" && resp.item_id && resp.item_id > 0
        ? resp.item_id
        : null;

    if (!itemId) {
      setScanHint(`条码 ${code} 尚未绑定商品，当前页面不承接条码绑定。`);
      return;
    }

    const target = items.find((it) => it.id === itemId);
    if (!target) {
      setScanHint(`条码 ${code} 已绑定商品，但当前列表未找到该商品，请刷新后重试。`);
      return;
    }

    setSelectedItem(target);
    setScanHint(`已按条码 ${code} 自动定位商品：${target.sku} / ${target.name}`);
    gotoEditor();
  }

  // --- 1. 首次加载商品 ---
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // --- 2. 若 URL 带入 ?barcode=xxx：仅保留“已绑定条码自动定位商品”
  useEffect(() => {
    if (!barcodeFromQuery) return;
    if (items.length === 0) return;

    let cancelled = false;

    async function resolveByProbe() {
      const code = barcodeFromQuery;
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
        setScanHint(`已按条码 ${code} 自动定位商品：${target.sku} / ${target.name}`);
        gotoEditor();
      } catch {
        if (cancelled) return;
      }
    }

    void resolveByProbe();

    return () => {
      cancelled = true;
    };
  }, [barcodeFromQuery, items, setSelectedItem]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品主数据（Items）</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items 是全系统统一的商品来源：入库、出库、库存、批次、订单都只认{" "}
          <span className="font-mono">item_id</span> / <span className="font-mono">sku</span>。
          商品新建可以暂不绑定供货商，后续可编辑补充供应商。本页只维护商品本体主数据；
          条码、箱码、包装单位、单位换算不再由本页治理。
          当前 <span className="font-mono">/items?barcode=xxx</span> 只保留已绑定条码自动定位商品。
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <div className="text-sm font-semibold text-slate-900">商品扫码定位</div>
          <div className="text-xs text-slate-500">
            这里的扫码只做商品主数据定位，真正的商品/包装识别真相来自 PMS public barcode probe。
          </div>
        </div>

        <ScanConsole
          title="扫码定位商品"
          placeholder="请在此处扫码商品条码 / 包装条码"
          modeLabel="PMS 商品"
          scanMode="auto"
          onScan={locateItemByBarcode}
        />

        {scanHint ? (
          <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            {scanHint}
          </div>
        ) : null}
      </section>

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
