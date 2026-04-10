// src/features/pms/items/pages/ItemBarcodesPage.tsx
//
// PMS 二级页：商品条码
//
// 当前职责：
// - 商品页不再承担条码治理职责
// - 本页成为条码治理唯一入口
// - 条码、箱码、包装单位、单位换算统一在本页治理
//
// 设计约束：
// - 不依赖 itemsStore.selectedItem
// - 直接使用 owner API 拉商品列表
// - 右侧治理区先治理包装单位/单位换算，再治理条码/箱码
// - 支持 /item-barcodes?barcode=xxx：
//   - BOUND：自动定位商品
//   - UNBOUND / ERROR：提示用户先选商品，并把条码自动带入右侧新增输入框

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Item } from "../../../../contracts/item/contract";
import { probeItemBarcode } from "../../../../domains/pms/public/barcodeProbeClient";
import { fetchItems } from "../api/itemsOwnerApi";
import ItemBarcodesSection from "../components/edit/ItemBarcodesSection";
import ItemUomsGovernanceSection from "../components/edit/ItemUomsGovernanceSection";

type ItemsBarcodeScannedDetail = { code: string };

function buildSearchText(item: Item): string {
  return [
    item.sku,
    item.name,
    item.spec ?? "",
    item.brand ?? "",
    item.category ?? "",
    item.supplier_name ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

const ItemBarcodesPage: React.FC = () => {
  const location = useLocation();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [barcodeHint, setBarcodeHint] = useState<string | null>(null);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);

  const barcodeFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("barcode");
    return code && code.trim() ? code.trim() : null;
  }, [location.search]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchItems();
      setItems(list);

      setSelectedItemId((current) => {
        if (current != null && list.some((x) => x.id === current)) return current;
        return null;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载商品列表失败";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const barcode = barcodeFromQuery;
    if (!barcode) {
      setBarcodeHint(null);
      setPendingBarcode(null);
      return;
    }

    if (items.length === 0) return;

    let cancelled = false;

    async function resolveByProbe(inputBarcode: string) {
      try {
        const resp = await probeItemBarcode(inputBarcode);
        if (cancelled) return;

        const itemId =
          resp.status === "BOUND" && resp.item_id && resp.item_id > 0
            ? resp.item_id
            : null;

        if (itemId) {
          const target = items.find((x) => x.id === itemId) ?? null;
          if (target) {
            setSelectedItemId(target.id);
            setPendingBarcode(null);
            setBarcodeHint(
              `已按条码 ${inputBarcode} 自动定位商品，可继续治理包装单位、单位换算和条码。`,
            );
          } else {
            setPendingBarcode(null);
            setBarcodeHint(
              `条码 ${inputBarcode} 已绑定商品，但当前列表中未找到该商品，请刷新后重试。`,
            );
          }
          return;
        }

        setPendingBarcode(inputBarcode);
        setBarcodeHint(
          `条码 ${inputBarcode} 尚未绑定商品。请先在左侧选择商品，系统会把该条码自动带入右侧新增输入框。`,
        );
      } catch {
        if (cancelled) return;
        setPendingBarcode(inputBarcode);
        setBarcodeHint(
          `条码 ${inputBarcode} 解析失败。请先在左侧选择商品，再在右侧手动完成条码绑定。`,
        );
      }
    }

    void resolveByProbe(barcode);

    return () => {
      cancelled = true;
    };
  }, [barcodeFromQuery, items]);

  useEffect(() => {
    if (!selectedItemId || !pendingBarcode) return;

    const code = pendingBarcode.trim();
    if (!code) return;

    requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent<ItemsBarcodeScannedDetail>("items:barcode-scanned", {
          detail: { code },
        }),
      );
    });

    setBarcodeHint(`已将条码 ${code} 带入右侧新增输入框，请确认后保存。`);
    setPendingBarcode(null);
  }, [selectedItemId, pendingBarcode]);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => buildSearchText(item).includes(q));
  }, [items, keyword]);

  const selectedItem = useMemo(() => {
    if (selectedItemId == null) return null;
    return items.find((x) => x.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">商品条码</h1>
        <p className="mt-1 text-sm text-slate-500">
          本页是商品条码治理唯一入口。商品管理页只维护商品本体主数据，
          不再承担条码、箱码、包装单位、单位换算治理职责。
          当前建议顺序：先维护包装单位与单位换算，再治理条码/箱码。
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {barcodeHint ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
          {barcodeHint}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-900">选择商品</div>
              <div className="text-sm text-slate-500">
                先选商品，再在右侧治理包装单位、单位换算和条码。
              </div>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? "刷新中…" : "刷新"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <input
              className="w-full rounded border px-3 py-2 bg-white"
              placeholder="按 SKU / 商品名称 / 规格 / 品牌 / 品类 / 供应商搜索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={loading}
            />
            <div className="text-sm text-slate-500">
              共 <span className="font-mono">{items.length}</span> 个商品，
              当前结果 <span className="font-mono">{filteredItems.length}</span> 个
            </div>
          </div>

          <div className="overflow-auto rounded border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b px-3 py-2 text-left font-semibold">SKU</th>
                  <th className="border-b px-3 py-2 text-left font-semibold">商品名称</th>
                  <th className="border-b px-3 py-2 text-left font-semibold">规格</th>
                  <th className="border-b px-3 py-2 text-left font-semibold">供应商</th>
                  <th className="border-b px-3 py-2 text-left font-semibold">操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const active = item.id === selectedItemId;
                  return (
                    <tr
                      key={item.id}
                      className={active ? "border-t bg-slate-50" : "border-t"}
                    >
                      <td className="px-3 py-2 font-mono">{item.sku}</td>
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-slate-600">{item.spec ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{item.supplier_name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedItemId(item.id)}
                          className={
                            active
                              ? "rounded bg-slate-900 px-3 py-1.5 text-white"
                              : "rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          }
                        >
                          {active ? "当前商品" : "开始治理"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      没有匹配的商品
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div>
            <div className="text-base font-semibold text-slate-900">治理面板</div>
            <div className="mt-1 text-sm text-slate-500">
              本页统一治理包装单位、单位换算、条码和箱码；不再回流到商品管理页。
            </div>
          </div>

          {selectedItem ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div>
                  当前商品：<span className="font-medium">{selectedItem.name}</span>
                </div>
                <div className="mt-1">
                  SKU：<span className="font-mono">{selectedItem.sku}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  规格：{selectedItem.spec ?? "—"}
                  <span className="mx-2 text-slate-300">|</span>
                  供应商：{selectedItem.supplier_name ?? "—"}
                </div>
              </div>

              <ItemUomsGovernanceSection itemId={selectedItem.id} />
              <ItemBarcodesSection itemId={selectedItem.id} />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              请先在左侧选择一个商品，再开始治理包装单位、单位换算和条码。
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ItemBarcodesPage;
