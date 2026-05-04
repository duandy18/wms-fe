// src/features/pms/fsku/types.ts

export type PmsFskuStatus = "draft" | "published" | "retired";
export type PmsFskuShape = "single" | "bundle";

export type PmsFskuComponent = {
  component_sku_code: string;
  qty_per_fsku: number | string;
  alloc_unit_price: number | string;
  resolved_item_id: number;
  resolved_item_sku_code_id: number;
  resolved_item_uom_id: number;
  sku_code_snapshot: string;
  item_name_snapshot: string;
  uom_snapshot: string;
  sort_order: number;
};

export type PmsFskuListItem = {
  id: number;
  code: string;
  name: string;
  shape: PmsFskuShape;
  status: PmsFskuStatus;
  fsku_expr: string;
  components_summary: string;
  components_summary_name: string;
  published_at: string | null;
  retired_at: string | null;
  updated_at: string;
};

export type PmsFskuDetail = PmsFskuListItem & {
  created_at?: string;
  components: PmsFskuComponent[];
};

export type PmsFskuListOut = {
  items: PmsFskuListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type PmsFskuCreateInput = {
  name: string;
  code?: string | null;
  shape: PmsFskuShape;
  fsku_expr: string;
};

export type PmsFskuExpressionInput = {
  fsku_expr: string;
};
