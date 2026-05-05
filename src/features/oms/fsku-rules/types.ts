// src/features/oms/fsku-rules/types.ts

export type OmsFskuStatus = "draft" | "published" | "retired";
export type OmsFskuShape = "single" | "bundle";
export type OmsFskuExprType = "DIRECT" | "SEGMENT_GROUP";

export type OmsFskuComponent = {
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

export type OmsFskuListItem = {
  id: number;
  code: string;
  name: string;
  shape: OmsFskuShape;
  status: OmsFskuStatus;
  fsku_expr: string;
  normalized_expr: string;
  expr_type: OmsFskuExprType;
  component_count: number;
  components_summary: string;
  components_summary_name: string;
  published_at: string | null;
  retired_at: string | null;
  updated_at: string;
};

export type OmsFskuDetail = OmsFskuListItem & {
  created_at?: string;
  components: OmsFskuComponent[];
};

export type OmsFskuListOut = {
  items: OmsFskuListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type OmsFskuCreateInput = {
  name: string;
  code?: string | null;
  shape: OmsFskuShape;
  fsku_expr: string;
};

export type OmsFskuExpressionInput = {
  fsku_expr: string;
};
