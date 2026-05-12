export type PmsProjectionResource =
  | "items"
  | "suppliers"
  | "uoms"
  | "sku-codes"
  | "barcodes";

export type PmsProjectionSyncRunStatus = "RUNNING" | "SUCCESS" | "FAILED";

export type PmsProjectionSyncRun = {
  id: number;
  resource: string;
  status: PmsProjectionSyncRunStatus;
  fetched: number;
  upserted: number;
  pages: number;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  triggered_by_user_id: number | null;
  pms_api_base_url_snapshot: string | null;
  sync_version: string | null;
};

export type PmsProjectionResourceStatus = {
  resource: PmsProjectionResource;
  table_name: string;
  row_count: number;
  max_synced_at: string | null;
  last_sync_run: PmsProjectionSyncRun | null;
};

export type PmsProjectionIntegrationStatus = {
  pms_api_base_url_configured: boolean;
  resources: PmsProjectionResourceStatus[];
};

export type PmsProjectionList = {
  resource: PmsProjectionResource;
  table_name: string;
  limit: number;
  offset: number;
  total: number;
  columns: string[];
  rows: Record<string, unknown>[];
};

export type PmsProjectionSyncResult = {
  run: PmsProjectionSyncRun;
};

export type PmsProjectionCheckIssue = {
  issue_type: string;
  resource: PmsProjectionResource;
  source_id: string;
  message: string;
  item_id: number | null;
  item_uom_id: number | null;
  supplier_id: number | null;
  projection_item_id: number | null;
};

export type PmsProjectionCheckResult = {
  resource: PmsProjectionResource;
  ok: boolean;
  issue_count: number;
  issues: PmsProjectionCheckIssue[];
};

export type PmsProjectionSyncRuns = {
  resource: PmsProjectionResource | null;
  limit: number;
  runs: PmsProjectionSyncRun[];
};

export type PmsProjectionResourceConfig = {
  resource: PmsProjectionResource;
  label: string;
  routePath: string;
  tableName: string;
  description: string;
  primaryColumn: string;
};

export const PMS_PROJECTION_RESOURCES: PmsProjectionResourceConfig[] = [
  {
    resource: "items",
    label: "商品投影",
    routePath: "/admin/pms-integration/items",
    tableName: "wms_pms_item_projection",
    description: "从 PMS 商品主数据同步到 WMS 的只读商品当前状态索引。",
    primaryColumn: "item_id",
  },
  {
    resource: "suppliers",
    label: "供应商投影",
    routePath: "/admin/pms-integration/suppliers",
    tableName: "wms_pms_supplier_projection",
    description: "从 PMS 供应商主数据同步到 WMS 的只读供应商当前状态索引。",
    primaryColumn: "supplier_id",
  },
  {
    resource: "uoms",
    label: "包装单位投影",
    routePath: "/admin/pms-integration/uoms",
    tableName: "wms_pms_uom_projection",
    description: "从 PMS 包装单位同步到 WMS 的只读包装单位当前状态索引。",
    primaryColumn: "item_uom_id",
  },
  {
    resource: "sku-codes",
    label: "SKU 编码投影",
    routePath: "/admin/pms-integration/sku-codes",
    tableName: "wms_pms_sku_code_projection",
    description: "从 PMS SKU 编码同步到 WMS 的只读 SKU 编码当前状态索引。",
    primaryColumn: "sku_code_id",
  },
  {
    resource: "barcodes",
    label: "条码投影",
    routePath: "/admin/pms-integration/barcodes",
    tableName: "wms_pms_barcode_projection",
    description: "从 PMS 条码同步到 WMS 的只读条码当前状态索引。",
    primaryColumn: "barcode_id",
  },
];

export const PMS_PROJECTION_RESOURCE_MAP: Record<
  PmsProjectionResource,
  PmsProjectionResourceConfig
> = PMS_PROJECTION_RESOURCES.reduce(
  (acc, item) => {
    acc[item.resource] = item;
    return acc;
  },
  {} as Record<PmsProjectionResource, PmsProjectionResourceConfig>,
);
