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
  { key: "uom_snapshot", label: "最小单位（uom_snapshot）", align: "left" },
  { key: "case_uom_snapshot", label: "采购单位（case_uom）", align: "left" },
  { key: "case_ratio_snapshot", label: "倍率（case_ratio）", align: "right" },
  { key: "qty_ordered_case_input", label: "订购数量（case_input）", align: "right" },
  { key: "qty_base", label: "数量（base 事实）", align: "right" },
  { key: "supply_price", label: "采购单价(每最小单位)", align: "right" },
  { key: "line_amount", label: "行金额(预估)", align: "right" },
  { key: "ops", label: "操作", align: "left" },
];

export const PO_CREATE_LINE_COLSPAN = PO_CREATE_LINE_COLUMNS.length;
