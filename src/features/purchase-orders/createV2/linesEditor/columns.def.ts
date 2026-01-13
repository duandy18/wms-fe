// src/features/purchase-orders/createV2/linesEditor/columns.def.ts

export type ColumnDef = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export const PO_CREATE_LINE_COLUMNS: ColumnDef[] = [
  { key: "idx", label: "#", align: "left" },
  { key: "system_item", label: "系统商品", align: "left" },
  { key: "item_name", label: "商品名称", align: "left" },
  { key: "brand", label: "品牌", align: "left" },
  { key: "category", label: "分类", align: "left" },
  { key: "barcode", label: "条码", align: "left" }, // ✅ 新增
  { key: "spec", label: "规格", align: "left" },
  { key: "base_uom", label: "最小单位", align: "left" },
  { key: "purchase_uom", label: "采购单位", align: "left" },
  { key: "units_per_case", label: "每件数量", align: "right" },
  { key: "qty_ordered", label: "订购件数", align: "right" },
  { key: "qty_base", label: "数量（最小单位）", align: "right" },
  { key: "supply_price", label: "采购单价(每最小单位)", align: "right" },
  { key: "line_amount", label: "行金额(预估)", align: "right" },
  { key: "ops", label: "操作", align: "left" },
];

export const PO_CREATE_LINE_COLSPAN = PO_CREATE_LINE_COLUMNS.length;
