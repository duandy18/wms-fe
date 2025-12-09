// src/features/admin/items/ItemBarcodesPanel.tsx
//
// 条码管理面板（底部独立卡片版）
// - 总是渲染一个卡片；
//   * 若尚未选中商品：显示提示文案；
//   * 若已有 selectedItem：显示条码列表 + 新增/设主/删除。
// - 有 scannedBarcode 时自动把条码灌入“新增条码”的输入框，方便从扫描台上下文进入绑定流程。

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
  const setPrimaryBarcodeLocal = useItemsStore(
    (s) => s.setPrimaryBarcodeLocal,
  );
  const loadItems = useItemsStore((s) => s.loadItems);

  const [barcodes, setBarcodes] = useState<ItemBarcode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newKind, setNewKind] = useState("CUSTOM");
  const [saving, setSaving] = useState(false);

  // 选中商品变化 → 加载条码
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
        setPrimaryBarcodeLocal(
          selectedItem.id,
          primary ? primary.barcode : null,
        );
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

  // 扫码过来的条码：只要有扫描，就把新增输入框直接灌成该条码
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
      setPrimaryBarcodeLocal(
        selectedItem.id,
        primary ? primary.barcode : null,
      );
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
        kind: newKind || "CUSTOM",
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
    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          条码管理
        </h3>
        {selectedItem && (
          <span className="text-[11px] text-slate-500">
            当前商品：#{selectedItem.id} / {selectedItem.sku}
          </span>
        )}
      </div>

      {!selectedItem ? (
        <div className="text-xs text-slate-500">
          尚未选择商品。你可以：
          <br />
          ① 在上方“商品列表”中点击「管理条码」按钮；<br />
          ② 或在页面顶部的「Items 条码扫描台」扫描一个已绑定条码，系统会自动定位商品。
        </div>
      ) : (
        <>
          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          {loading ? (
            <div className="text-xs text-slate-500">条码加载中…</div>
          ) : barcodes.length === 0 ? (
            <div className="text-xs text-slate-500">
              当前商品尚未配置任何条码，可通过下方表单新增。
            </div>
          ) : (
            <div className="overflow-auto rounded border border-slate-200 bg-white">
              <table className="min-w-full text-[11px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b px-2 py-1 text-left">ID</th>
                    <th className="border-b px-2 py-1 text-left">条码</th>
                    <th className="border-b px-2 py-1 text-left">类型</th>
                    <th className="border-b px-2 py-1 text-left">主条码</th>
                    <th className="border-b px-2 py-1 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {barcodes.map((b) => (
                    <tr
                      key={b.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-2 py-1">{b.id}</td>
                      <td className="px-2 py-1 font-mono">
                        {b.barcode}
                      </td>
                      <td className="px-2 py-1">{b.kind}</td>
                      <td className="px-2 py-1">
                        {b.is_primary ? (
                          <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                            主条码
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSetPrimary(b.id)}
                            className="rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50"
                          >
                            设为主条码
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="text-[11px] text-red-600 hover:underline"
                          onClick={() => void handleDelete(b.id)}
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

          {/* 新增条码表单 */}
          <form
            className="mt-2 flex flex-wrap items-center gap-2"
            onSubmit={handleAdd}
          >
            <input
              className="min-w-[180px] rounded border bg-white px-2 py-1 text-[11px] font-mono"
              placeholder="扫描或输入新条码"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />

            <select
              className="rounded border bg白 px-2 py-1 text-[11px]"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value)}
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
              className="rounded bg-slate-900 px-3 py-1 text-[11px] text-white disabled:opacity-60"
            >
              {saving ? "保存中…" : "新增条码并设为主"}
            </button>
          </form>
        </>
      )}
    </section>
  );
};
