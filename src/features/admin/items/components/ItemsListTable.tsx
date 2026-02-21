// src/features/admin/items/components/ItemsListTable.tsx

import React, { useState } from "react";
import type { Item } from "../../../../contracts/item/contract";
import { useItemsStore } from "../itemsStore";

type UnknownRecord = Record<string, unknown>;

function asRecord(v: unknown): UnknownRecord {
  return (v ?? {}) as UnknownRecord;
}

function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function getBoolean(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}

function hasShelfLife(it: Item): boolean {
  // it.has_shelf_life 在 generated schema 里可能是 optional/nullable
  return Boolean((it as UnknownRecord)["has_shelf_life"]);
}

function supplierLabel(it: Item): string {
  const r = asRecord(it);

  const sn = getString(r["supplier_name"]);
  if (sn && sn.trim()) return sn;

  const sp = getString(r["supplier"]);
  if (sp && sp.trim()) return sp;

  const sid = r["supplier_id"];
  if (typeof sid === "number" || typeof sid === "string") return `ID=${String(sid)}`;

  return "—";
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
}> = ({ rows, primaryBarcodes, onEdit }) => {
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
          <th className="border px-4 py-3 text-left font-semibold">规格</th>
          <th className="border px-4 py-3 text-left font-semibold">品牌</th>
          <th className="border px-4 py-3 text-left font-semibold">品类</th>
          <th className="border px-4 py-3 text-left font-semibold">测试集合</th>
          <th className="border px-4 py-3 text-left font-semibold">供货商</th>
          <th className="border px-4 py-3 text-left font-semibold">单位净重(kg)</th>
          <th className="border px-4 py-3 text-left font-semibold">最小包装单位</th>
          <th className="border px-4 py-3 text-left font-semibold">有效期</th>
          <th className="border px-4 py-3 text-left font-semibold">默认保质期</th>
          <th className="border px-4 py-3 text-left font-semibold">状态</th>
          <th className="border px-4 py-3 text-left font-semibold">编辑</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((it) => {
          const r = asRecord(it);

          const spec = getString(r["spec"]) ?? "—";
          const brand = getString(r["brand"]) ?? "—";
          const category = getString(r["category"]) ?? "—";

          const isTest = Boolean(getBoolean(r["is_test"]) ?? false);
          const enabled = Boolean(getBoolean(r["enabled"]) ?? false);

          const weight = r["weight_kg"];
          const weightText = weight === null || weight === undefined ? "—" : String(weight);

          const uom = getString(r["uom"]) ?? "—";

          const hasSL = hasShelfLife(it);
          const sv = hasSL ? formatShelfValue(r["shelf_life_value"]) : "—";
          const su = hasSL ? formatShelfUnitCn(r["shelf_life_unit"]) : "—";
          const shelfText = hasSL && sv !== "—" && su !== "—" ? `${sv} ${su}` : "—";
          const shelfMissing = hasSL && (sv === "—" || su === "—");

          const disabled = savingId === it.id;

          return (
            <tr key={it.id} className="border-t">
              <td className="px-4 py-3 font-mono">{it.sku}</td>
              <td className="px-4 py-3 font-mono">{it.id}</td>
              <td className="px-4 py-3 font-mono">{primaryBarcodes[it.id] ?? "—"}</td>
              <td className="px-4 py-3 font-medium">{it.name}</td>

              <td className="px-4 py-3 text-slate-700 whitespace-pre-line">{spec}</td>
              <td className="px-4 py-3">{brand}</td>
              <td className="px-4 py-3">{category}</td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <TestBadge isTest={isTest} />
                  <label className="inline-flex items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={isTest}
                      disabled={disabled}
                      onChange={(e) => void onToggle(it, e.target.checked)}
                    />
                    <span className="text-[12px] text-slate-600">{disabled ? "保存中…" : "切换"}</span>
                  </label>
                </div>
              </td>

              <td className="px-4 py-3">{supplierLabel(it)}</td>
              <td className="px-4 py-3 font-mono">{weightText}</td>
              <td className="px-4 py-3">{uom}</td>
              <td className="px-4 py-3">{hasSL ? "有" : "无"}</td>

              <td className="px-4 py-3 font-mono">
                {shelfText}
                {shelfMissing ? <span className="ml-2 text-[11px] text-amber-700">未配置</span> : null}
              </td>

              <td className="px-4 py-3">
                <StatusBadge enabled={enabled} />
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ItemsListTable;
