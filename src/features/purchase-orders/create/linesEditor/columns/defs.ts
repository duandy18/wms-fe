// src/features/purchase-orders/create/linesEditor/columns/defs.ts

export type ColumnDef = {
  key: string;
  label: string;
  align?: "left" | "right";
};

export const PO_CREATE_LINE_COLUMNS: ColumnDef[] = [
  { key: "idx", label: "#", align: "left" },
  { key: "system_item", label: "系统商品", align: "left" },
  { key: "item_info", label: "商品信息", align: "left" },

  { key: "uom_id", label: "输入单位", align: "left" },
  { key: "qty_input", label: "数量", align: "right" },
  { key: "qty_base_hint", label: "预计 BASE", align: "right" },

  { key: "supply_price", label: "采购单价", align: "right" },
  { key: "discount_amount", label: "折扣金额", align: "right" },
  { key: "discount_note", label: "折扣说明", align: "left" },
  { key: "remark", label: "行备注", align: "left" },

  { key: "line_amount", label: "行金额(预估)", align: "right" },
  { key: "ops", label: "操作", align: "left" },
];

export const PO_CREATE_LINE_COLSPAN = PO_CREATE_LINE_COLUMNS.length;
