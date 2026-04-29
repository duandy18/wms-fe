// src/features/pms/items/components/ItemsListTable.tsx

import React, { useMemo, useState } from "react";
import type { Item } from "../../../../contracts/item/contract";
import { computeItemQuality } from "../quality/itemQuality";
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

export const ItemsListTable: React.FC<{
  rows: Item[];
  primaryBarcodes: Record<number, string>;
  onEdit: (it: Item) => void;
}> = ({ rows, primaryBarcodes, onEdit }) => {
  const [qualityFilter, setQualityFilter] = useState<"all" | "issues">("all");

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
        </div>
      </div>

      <table className="min-w-full border-collapse text-base">
        <thead>
          <tr className="bg-slate-50">
            <th className="border px-4 py-3 text-left font-semibold">SKU</th>
            <th className="border px-4 py-3 text-left font-semibold">商品名称</th>
            <th className="border px-4 py-3 text-left font-semibold">规格</th>
            <th className="border px-4 py-3 text-left font-semibold">品牌</th>
            <th className="border px-4 py-3 text-left font-semibold">品类</th>

            <th className="border px-4 py-3 text-left font-semibold">质量提示</th>

            <th className="border px-4 py-3 text-left font-semibold">供货商</th>

            <th className="border px-4 py-3 text-left font-semibold">批次策略</th>
            <th className="border px-4 py-3 text-left font-semibold">有效期策略</th>
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

            const enabled = Boolean(getBoolean(r["enabled"]) ?? false);

            const lotSourcePolicy = policyCnLotSource(r["lot_source_policy"]);
            const expiryPolicy = policyCnExpiry(r["expiry_policy"]);

            const sv = formatShelfValue(r["shelf_life_value"]);
            const su = formatShelfUnitCn(r["shelf_life_unit"]);
            const shelfText = sv !== "—" && su !== "—" ? `${sv} ${su}` : "—";

            const issuesTitle =
              q.issues.length === 0
                ? ""
                : q.issues
                    .map((x) => {
                      const tag = x.severity === "high" ? "【严重】" : "【提示】";
                      return `- ${tag}${x.message}`;
                    })
                    .join("\n");

            return (
              <tr key={it.id} className="border-t">
                <td className="px-4 py-3 font-mono">{it.sku}</td>
                <td className="px-4 py-3 font-medium">{it.name}</td>

                <td className="px-4 py-3 text-slate-700 whitespace-pre-line">{spec}</td>
                <td className="px-4 py-3">{brand}</td>
                <td className="px-4 py-3">{category}</td>

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

                <td className="px-4 py-3">{lotSourcePolicy}</td>
                <td className="px-4 py-3">{expiryPolicy}</td>
                <td className="px-4 py-3 font-mono">{shelfText}</td>

                <td className="px-4 py-3">
                  <StatusBadge enabled={enabled} />
                </td>

                <td className="px-4 py-3">
                  <button
                    className="rounded bg-emerald-100 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-200"
                    onClick={() => onEdit(it)}
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
