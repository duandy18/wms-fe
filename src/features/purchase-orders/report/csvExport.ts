// src/features/purchase-orders/report/csvExport.ts

import type { PurchaseOrderWithLines } from "../api";
import type { ItemBasic } from "../../../master-data/itemsApi";
import { buildItemMap, lookupItem } from "./itemLookup";
import { parseMoney } from "./totals";

function esc(v: unknown): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export function exportPurchaseOrderCsv(args: {
  po: PurchaseOrderWithLines;
  items: ItemBasic[];
}): void {
  const { po, items } = args;
  const itemMap = buildItemMap(items);

  const totalAmount = parseMoney(po.total_amount);

  const totalQtyCases = po.lines.reduce(
    (sum, l) => sum + (l.qty_cases ?? l.qty_ordered ?? 0),
    0,
  );
  const totalUnits = po.lines.reduce(
    (sum, l) => sum + (l.qty_cases ?? l.qty_ordered ?? 0) * (l.units_per_case ?? 1),
    0,
  );

  const header = [
    "行号",
    "商品ID",
    "商品名",
    "条码",
    "品牌",
    "分类",
    "规格",
    "最小单位",
    "采购单位",
    "每件数量",
    "订购件数",
    "数量(最小单位)",
    "单价(每最小单位)",
    "行金额",
  ];

  const dataRows = po.lines.map((l) => {
    const qtyCases = l.qty_cases ?? l.qty_ordered ?? 0;
    const unitsPerCase = l.units_per_case ?? 1;
    const qtyBase = qtyCases * unitsPerCase;

    const meta = lookupItem(itemMap, l.item_id);

    return [
      l.line_no,
      l.item_id,
      meta.name,
      meta.barcode,
      meta.brand,
      meta.category,
      l.spec_text ?? "",
      l.base_uom ?? "",
      l.purchase_uom ?? "",
      unitsPerCase,
      qtyCases,
      qtyBase,
      l.supply_price ?? "",
      l.line_amount ?? "",
    ];
  });

  const sumRow = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    totalQtyCases,
    totalUnits,
    "",
    totalAmount.toFixed(2),
  ];

  const csv = [header, ...dataRows, sumRow]
    .map((row) => row.map(esc).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `purchase-order-${po.id}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
