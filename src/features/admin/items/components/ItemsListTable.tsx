// src/features/admin/items/components/ItemsListTable.tsx

import React, { useState } from "react";
import type { Item } from "../api";
import { useItemsStore } from "../itemsStore";

function hasShelfLife(it: Item): boolean {
  return !!it.has_shelf_life;
}

function supplierLabel(it: Item): string {
  return it.supplier_name ?? it.supplier ?? (it.supplier_id != null ? `ID=${it.supplier_id}` : "—");
}

function formatShelfValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(Math.trunc(n));
}

function formatShelfUnitCn(u: unknown): string {
  if (!u) return "—";
  const s = String(u).toUpperCase();
  if (s === "MONTH") return "月";
  if (s === "DAY") return "天";
  return "—";
}

const StatusBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  return enabled ? (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-emerald-100 text-emerald-800">
      有效
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-2 py-1 text-sm font-semibold bg-red-100 text-red-800">
      无效
    </span>
  );
};

const TestBadge: React.FC<{ isTest: boolean }> = ({ isTest }) => {
  return isTest ? (
    <span className="inline-flex items-center rounded px-2 py-1 text-[12px] font-semibold border border-amber-200 bg-amber-50 text-amber-800">
      TEST
    </span>
  ) : (
    <span className="inline-flex items-center rounded px-2 py-1 text-[12px] font-semibold border border-slate-200 bg-white text-slate-600">
      PROD
    </span>
  );
};

export const ItemsListTable: React.FC<{
  rows: Item[];
  primaryBarcodes: Record<number, string>;
  onEdit: (it: Item) => void;
  onManageBarcodes: (it: Item) => void;
}> = ({ rows, primaryBarcodes, onEdit, onManageBarcodes }) => {
  const toggleItemTest = useItemsStore((s) => s.toggleItemTest);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function onToggle(it: Item, next: boolean): Promise<void> {
    setSavingId(it.id);
    try {
      await toggleItemTest({ itemId: it.id, next });
    } finally {
      setSavingId((cur) => (cur === it.id ? null : cur));
    }
  }

  return (
    <table className="min-w-full border-collapse text-base">
      <thead>
        <tr className="bg-slate-50">
          <th className="border px-4 py-3 text-left font-semibold">SKU</th>
          <th className="border px-4 py-3 text-left font-semibold">商品ID</th>
          <th className="border px-4 py-3 text-left font-semibold">主条码</th>
          <th className="border px-4 py-3 text-left font-semibold">商品名称</th>

          {/* ✅ 新增：品牌 / 品类 */}
          <th className="border px-4 py-3 text-left font-semibold">品牌</th>
          <th className="border px-4 py-3 text-left font-semibold">品类</th>

          {/* ✅ 新增：测试集合显性化（DEFAULT） */}
          <th className="border px-4 py-3 text-left font-semibold">测试集合</th>

          <th className="border px-4 py-3 text-left font-semibold">供货商</th>
          <th className="border px-4 py-3 text-left font-semibold">单位净重(kg)</th>
          <th className="border px-4 py-3 text-left font-semibold">最小包装单位</th>
          <th className="border px-4 py-3 text-left font-semibold">有效期</th>
          <th className="border px-4 py-3 text-left font-semibold">默认有效期值</th>
          <th className="border px-4 py-3 text-left font-semibold">单位</th>
          <th className="border px-4 py-3 text-left font-semibold">状态</th>
          <th className="border px-4 py-3 text-left font-semibold">编辑</th>
          <th className="border px-4 py-3 text-left font-semibold">条码</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((it) => {
          const hasSL = hasShelfLife(it);
          const sv = hasSL ? formatShelfValue(it.shelf_life_value) : "—";
          const su = hasSL ? formatShelfUnitCn(it.shelf_life_unit) : "—";
          const disabled = savingId === it.id;

          return (
            <tr key={it.id} className="border-t">
              <td className="px-4 py-3 font-mono">{it.sku}</td>
              <td className="px-4 py-3 font-mono">{it.id}</td>
              <td className="px-4 py-3 font-mono">{primaryBarcodes[it.id] ?? "—"}</td>
              <td className="px-4 py-3 font-medium">{it.name}</td>

              {/* ✅ brand/category */}
              <td className="px-4 py-3">{it.brand ?? "—"}</td>
              <td className="px-4 py-3">{it.category ?? "—"}</td>

              {/* ✅ 测试集合：Badge + Switch */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <TestBadge isTest={!!it.is_test} />
                  <label className="inline-flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={!!it.is_test}
                      disabled={disabled}
                      onChange={(e) => void onToggle(it, e.target.checked)}
                    />
                    <span className="text-[12px] text-slate-600">{disabled ? "保存中…" : "切换"}</span>
                  </label>
                </div>
              </td>

              <td className="px-4 py-3">{supplierLabel(it)}</td>
              <td className="px-4 py-3 font-mono">{it.weight_kg ?? "—"}</td>
              <td className="px-4 py-3">{it.uom ?? "—"}</td>
              <td className="px-4 py-3">{hasSL ? "有" : "无"}</td>

              <td className="px-4 py-3 font-mono">
                {sv}
                {hasSL && sv === "—" ? <span className="ml-2 text-[11px] text-amber-700">未配置</span> : null}
              </td>
              <td className="px-4 py-3">{su}</td>

              <td className="px-4 py-3">
                <StatusBadge enabled={!!it.enabled} />
              </td>

              <td className="px-4 py-3">
                <button
                  className="rounded bg-emerald-100 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-200 disabled:opacity-60"
                  onClick={() => onEdit(it)}
                  disabled={disabled}
                >
                  编辑
                </button>
              </td>

              <td className="px-4 py-3">
                <button
                  className="rounded bg-sky-100 px-4 py-2 text-sm text-sky-700 hover:bg-sky-200 disabled:opacity-60"
                  onClick={() => onManageBarcodes(it)}
                  disabled={disabled}
                >
                  管理
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ItemsListTable;
