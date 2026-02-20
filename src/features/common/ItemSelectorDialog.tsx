// src/features/common/ItemSelectorDialog.tsx
//
// SKU 选择对话框：
// - 支持输入关键词（name / sku）本地过滤
// - 使用 ItemsTable 一致的视觉风格（简化版）
// - 点击一行回调 (item_id, sku, name)

import React, { useMemo, useState } from "react";
import type { Item } from "@/contracts/item/contract";
import { useItemsStore } from "@/features/admin/items/itemsStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
};

export const ItemSelectorDialog: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
}) => {
  const items = useItemsStore((s) => s.items);
  const loading = useItemsStore((s) => s.loading);

  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return items;
    return items.filter((it) => {
      return (
        String(it.id).includes(k) ||
        (it.sku ?? "").toLowerCase().includes(k) ||
        (it.name ?? "").toLowerCase().includes(k)
      );
    });
  }, [items, keyword]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[720px] max-h-[80vh] rounded-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <div>
            <div className="text-sm font-semibold text-slate-800">
              选择商品（SKU）
            </div>
            <div className="text-xs text-slate-500">
              支持按 ID / SKU / 名称模糊过滤，点击一行即可选择。
            </div>
          </div>
          <button
            className="text-xs text-slate-500 hover:text-slate-800"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-200 px-4 py-2">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="输入 ID / SKU / 名称过滤"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              商品加载中…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              没有匹配的商品。
            </div>
          ) : (
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-left">名称</th>
                  <th className="px-3 py-2 text-left">规格</th>
                  <th className="px-3 py-2 text-left">最小单位</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr
                    key={it.id}
                    className="border-b border-slate-100 hover:bg-sky-50 cursor-pointer"
                    onClick={() => {
                      onSelect(it);
                      onClose();
                    }}
                  >
                    <td className="px-3 py-1.5">{it.id}</td>
                    <td className="px-3 py-1.5 font-mono">{it.sku}</td>
                    <td className="px-3 py-1.5">{it.name}</td>
                    <td className="px-3 py-1.5">{it.spec ?? "-"}</td>
                    <td className="px-3 py-1.5">{it.uom ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
