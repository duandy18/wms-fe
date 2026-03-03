// src/features/admin/items/components/ItemsListTable.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "../../../../contracts/item/contract";
import { useItemsStore } from "../itemsStore";
import { computeItemQuality } from "../quality/itemQuality";
import { fetchItemUomsByItems, type ItemUom } from "../../../../master-data/itemUomsApi";
import {
  asRecord,
  getBoolean,
  getString,
  supplierLabel,
  formatShelfUnitCn,
  formatShelfValue,
  policyCnLotSource,
  policyCnExpiry,
} from "./itemsListTableFormatters";
import { renderPackagingUoms } from "./itemsListTableUom";

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
  const [qualityFilter, setQualityFilter] = useState<"all" | "issues">("all");

  // ---- item_uoms 批量缓存（避免 N+1）----
  const [uomsByItemId, setUomsByItemId] = useState<Record<number, ItemUom[]>>({});
  const [uomsLoading, setUomsLoading] = useState(false);

  const itemIds = useMemo(() => rows.map((x) => x.id).filter((x) => Number.isFinite(x) && x > 0), [rows]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (itemIds.length === 0) {
        setUomsByItemId({});
        return;
      }

      setUomsLoading(true);
      try {
        const all = await fetchItemUomsByItems(itemIds);

        const m: Record<number, ItemUom[]> = {};
        for (const u of all) {
          const iid = Number(u.item_id);
          if (!Number.isFinite(iid) || iid <= 0) continue;
          (m[iid] ||= []).push(u);
        }

        // 排序：采购默认优先，其次最小包装单位
        for (const k of Object.keys(m)) {
          const iid = Number(k);
          m[iid].sort((a, b) => {
            const score = (x: ItemUom) => (x.is_purchase_default ? 0 : 10) + (x.is_base ? 0 : 1);
            return score(a) - score(b) || a.id - b.id;
          });
        }

        if (alive) setUomsByItemId(m);
      } catch (e) {
        console.error("fetchItemUomsByItems failed:", e);
        if (alive) setUomsByItemId({});
      } finally {
        if (alive) setUomsLoading(false);
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [itemIds]);

  const qualityRows = useMemo(() => {
    return rows.map((it) => {
      const primary = primaryBarcodes[it.id] ?? null;
      const q = computeItemQuality({ item: it, primaryBarcode: primary });
      return { it, q };
    });
  }, [rows, primaryBarcodes]);

  const qualityStats = useMemo(() => {
    const total = qualityRows.length;
    let issuesItems = 0;
    for (const x of qualityRows) {
      if (x.q.issues.length > 0) issuesItems += 1;
    }
    const okItems = Math.max(0, total - issuesItems);
    return { total, issuesItems, okItems };
  }, [qualityRows]);

  const filteredRows = useMemo(() => {
    if (qualityFilter === "all") return qualityRows;
    return qualityRows.filter((x) => x.q.issues.length > 0);
  }, [qualityRows, qualityFilter]);

  async function onToggle(it: Item, next: boolean): Promise<void> {
    setSavingId(it.id);
    try {
      await toggleItemTest({ itemId: it.id, next });
    } finally {
      setSavingId((cur) => (cur === it.id ? null : cur));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-700">
          <span className="mr-3">
            <span className="font-semibold text-amber-700">提示商品</span>{" "}
            <span className="font-mono">{qualityStats.issuesItems}</span>
          </span>
          <span className="mr-3">
            <span className="font-semibold text-slate-700">正常商品</span>{" "}
            <span className="font-mono">{qualityStats.okItems}</span>
          </span>
          <span className="text-slate-500">（质量提示仅用于治理观察，不影响保存）</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">筛选：</span>
          <button
            className={`rounded px-3 py-1 border ${
              qualityFilter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200"
            }`}
            onClick={() => setQualityFilter("all")}
            type="button"
          >
            全部
          </button>
          <button
            className={`rounded px-3 py-1 border ${
              qualityFilter === "issues"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-slate-700 border-slate-200"
            }`}
            onClick={() => setQualityFilter("issues")}
            type="button"
          >
            仅提示
          </button>
          {uomsLoading ? <span className="ml-2 text-slate-500">包装单位加载中…</span> : null}
        </div>
      </div>

      <table className="min-w-full border-collapse text-base">
        <thead>
          <tr className="bg-slate-50">
            <th className="border px-4 py-3 text-left font-semibold">SKU</th>
            <th className="border px-4 py-3 text-left font-semibold">主条码</th>
            <th className="border px-4 py-3 text-left font-semibold">商品名称</th>
            <th className="border px-4 py-3 text-left font-semibold">规格</th>
            <th className="border px-4 py-3 text-left font-semibold">品牌</th>
            <th className="border px-4 py-3 text-left font-semibold">品类</th>

            <th className="border px-4 py-3 text-left font-semibold">测试集合</th>
            <th className="border px-4 py-3 text-left font-semibold">质量提示</th>

            <th className="border px-4 py-3 text-left font-semibold">供货商</th>

            {/* ✅ 你要求的列标题 */}
            <th className="border px-4 py-3 text-left font-semibold">包装单位</th>

            <th className="border px-4 py-3 text-left font-semibold">批次策略</th>
            <th className="border px-4 py-3 text-left font-semibold">有效期策略</th>
            <th className="border px-4 py-3 text-left font-semibold">推导</th>

            <th className="border px-4 py-3 text-left font-semibold">单位净重(kg)</th>
            <th className="border px-4 py-3 text-left font-semibold">默认保质期</th>

            <th className="border px-4 py-3 text-left font-semibold">状态</th>
            <th className="border px-4 py-3 text-left font-semibold">编辑</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.map(({ it, q }) => {
            const r = asRecord(it);

            const spec = getString(r["spec"]) ?? "—";
            const brand = getString(r["brand"]) ?? "—";
            const category = getString(r["category"]) ?? "—";

            const isTest = Boolean(getBoolean(r["is_test"]) ?? false);
            const enabled = Boolean(getBoolean(r["enabled"]) ?? false);

            const weight = r["weight_kg"];
            const weightText = weight === null || weight === undefined ? "—" : String(weight);

            const lotSourcePolicy = policyCnLotSource(r["lot_source_policy"]);
            const expiryPolicy = policyCnExpiry(r["expiry_policy"]);
            const derivationAllowed = Boolean(getBoolean(r["derivation_allowed"]) ?? false);

            const sv = formatShelfValue(r["shelf_life_value"]);
            const su = formatShelfUnitCn(r["shelf_life_unit"]);
            const shelfText = sv !== "—" && su !== "—" ? `${sv} ${su}` : "—";

            const disabled = savingId === it.id;

            const issuesTitle =
              q.issues.length === 0
                ? ""
                : q.issues
                    .map((x) => {
                      const tag = x.severity === "high" ? "【严重】" : "【提示】";
                      return `- ${tag}${x.message}`;
                    })
                    .join("\n");

            const uoms = uomsByItemId[it.id] ?? [];

            return (
              <tr key={it.id} className="border-t">
                <td className="px-4 py-3 font-mono">{it.sku}</td>
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

                <td className="px-4 py-3">
                  {q.issues.length > 0 ? (
                    <span
                      className="inline-flex items-center rounded px-2 py-1 text-[12px] font-semibold bg-amber-100 text-amber-800"
                      title={issuesTitle}
                    >
                      提示 {q.issues.length}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3">{supplierLabel(it)}</td>

                {/* ✅ 你要求的包装单位渲染 */}
                <td className="px-4 py-3">{renderPackagingUoms(uoms)}</td>

                <td className="px-4 py-3">{lotSourcePolicy}</td>
                <td className="px-4 py-3">{expiryPolicy}</td>
                <td className="px-4 py-3">{derivationAllowed ? "允许" : "禁止"}</td>

                <td className="px-4 py-3 font-mono">{weightText}</td>
                <td className="px-4 py-3 font-mono">{shelfText}</td>

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
    </div>
  );
};

export default ItemsListTable;
