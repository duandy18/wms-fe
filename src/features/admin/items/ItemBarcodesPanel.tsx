// src/features/admin/items/ItemBarcodesPanel.tsx
//
// 条码管理面板（单层卡片版）
// - 去掉外圈（外圈由 ItemsPage 删除）
// - 未选中商品时：保留引导说明（字号放大）
// - 有明确“关闭”按钮：无输入也能退出
// - 字号整体放大 2 倍

import React, { useEffect, useState } from "react";
import { useItemsStore } from "./itemsStore";
import {
  fetchItemBarcodes,
  createItemBarcode,
  deleteItemBarcode,
  setPrimaryBarcode,
  type ItemBarcode,
} from "./barcodesApi";

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      detail?: string;
    };
  };
};

const getErrorMessage = (e: unknown, fallback: string): string => {
  const err = e as ApiErrorShape;
  return err?.response?.data?.detail ?? err?.message ?? fallback;
};

export const ItemBarcodesPanel: React.FC = () => {
  const selectedItem = useItemsStore((s) => s.selectedItem);
  const scannedBarcode = useItemsStore((s) => s.scannedBarcode);

  const setPrimaryBarcodeLocal = useItemsStore((s) => s.setPrimaryBarcodeLocal);
  const loadItems = useItemsStore((s) => s.loadItems);

  const setSelectedItem = useItemsStore((s) => s.setSelectedItem);
  const setPanelOpen = useItemsStore((s) => s.setPanelOpen);
  const setScannedBarcode = useItemsStore((s) => s.setScannedBarcode);

  const [barcodes, setBarcodes] = useState<ItemBarcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newKind, setNewKind] = useState("CUSTOM");
  const [saving, setSaving] = useState(false);

  const closePanel = () => {
    setSelectedItem(null);
    setPanelOpen(false);

    setBarcodes([]);
    setError(null);
    setNewCode("");
    setNewKind("CUSTOM");
    setSaving(false);
    setLoading(false);

    setScannedBarcode(null);
  };

  useEffect(() => {
    if (!selectedItem) {
      setBarcodes([]);
      setError(null);
      setNewCode("");
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchItemBarcodes(selectedItem.id);
        if (cancelled) return;
        setBarcodes(list);
        const primary = list.find((b) => b.is_primary);
        setPrimaryBarcodeLocal(selectedItem.id, primary ? primary.barcode : null);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(e, "加载条码失败"));
          setBarcodes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [selectedItem, setPrimaryBarcodeLocal]);

  useEffect(() => {
    if (!scannedBarcode) return;
    setNewCode(scannedBarcode);
  }, [scannedBarcode]);

  const refresh = async () => {
    if (!selectedItem) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchItemBarcodes(selectedItem.id);
      setBarcodes(list);
      const primary = list.find((b) => b.is_primary);
      setPrimaryBarcodeLocal(selectedItem.id, primary ? primary.barcode : null);
      await loadItems();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "刷新条码列表失败"));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const code = newCode.trim();
    if (!code) {
      setError("条码不能为空");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await createItemBarcode({
        item_id: selectedItem.id,
        barcode: code,
        kind: newKind,
        active: true,
      });

      await setPrimaryBarcode(created.id);
      await refresh();
      setNewCode("");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "新增条码失败"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedItem) return;
    if (!window.confirm("确认删除该条码吗？")) return;

    try {
      await deleteItemBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "删除条码失败"));
    }
  };

  const handleSetPrimary = async (id: number) => {
    if (!selectedItem) return;
    try {
      await setPrimaryBarcode(id);
      await refresh();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "设置主条码失败"));
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">条码管理</h3>
        <button
          type="button"
          onClick={closePanel}
          className="rounded border border-slate-300 px-4 py-2 text-base hover:bg-slate-50"
        >
          关闭
        </button>
      </div>

      {!selectedItem ? (
        <div className="text-lg text-slate-600 leading-relaxed">
          尚未选择商品。你可以：
          <br />
          ① 在上方“商品列表”中点击「管理」按钮；
          <br />
          ② 或在页面顶部的「Items 条码扫描台」扫描一个已绑定条码，系统会自动定位商品。
        </div>
      ) : (
        <>
          {error && <div className="text-lg text-red-600">{error}</div>}

          {loading ? (
            <div className="text-lg text-slate-600">条码加载中…</div>
          ) : barcodes.length === 0 ? (
            <div className="text-lg text-slate-600">当前商品尚未配置条码。</div>
          ) : (
            <div className="overflow-auto rounded border border-slate-200">
              <table className="min-w-full text-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b px-4 py-3 text-left">ID</th>
                    <th className="border-b px-4 py-3 text-left">条码</th>
                    <th className="border-b px-4 py-3 text-left">类型</th>
                    <th className="border-b px-4 py-3 text-left">主条码</th>
                    <th className="border-b px-4 py-3 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {barcodes.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="px-4 py-3">{b.id}</td>
                      <td className="px-4 py-3 font-mono">{b.barcode}</td>
                      <td className="px-4 py-3">{b.kind}</td>
                      <td className="px-4 py-3">
                        {b.is_primary ? (
                          <span className="rounded bg-emerald-100 px-3 py-1 text-base text-emerald-700">
                            主条码
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSetPrimary(b.id)}
                            className="rounded border px-3 py-1 text-base hover:bg-slate-50"
                          >
                            设为主条码
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleDelete(b.id)}
                          className="text-base text-red-600 hover:underline"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-3">
            <input
              className="min-w-[280px] rounded border px-4 py-3 text-lg font-mono"
              placeholder="新条码"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              disabled={saving}
            />

            <select
              className="rounded border px-4 py-3 text-lg"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value)}
              disabled={saving}
            >
              <option value="CUSTOM">CUSTOM</option>
              <option value="EAN13">EAN13</option>
              <option value="EAN8">EAN8</option>
              <option value="UPC">UPC</option>
              <option value="INNER">INNER</option>
            </select>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-slate-900 px-5 py-3 text-lg text-white disabled:opacity-60"
            >
              {saving ? "保存中…" : "新增并设为主"}
            </button>
          </form>
        </>
      )}
    </section>
  );
};
