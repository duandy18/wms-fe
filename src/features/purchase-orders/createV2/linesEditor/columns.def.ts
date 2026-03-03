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
  { key: "barcode", label: "条码", align: "left" },
  { key: "spec", label: "规格", align: "left" },

  // ✅ 终态：uom_id + qty_input
  { key: "uom_id", label: "输入单位（uom_id）", align: "left" },
  { key: "qty_input", label: "数量（qty_input）", align: "right" },

  // ✅ 提示：预计 base（只提示，不作为事实）
  { key: "qty_base_hint", label: "预计 base", align: "right" },

  { key: "supply_price", label: "采购单价(每最小单位)", align: "right" },
  { key: "line_amount", label: "行金额(预估)", align: "right" },
  { key: "ops", label: "操作", align: "left" },
];

export const PO_CREATE_LINE_COLSPAN = PO_CREATE_LINE_COLUMNS.length;
