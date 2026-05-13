export type OmsProjectionResource = "orders" | "lines" | "components";

export type OmsProjectionRow = Record<string, unknown>;

export type OmsProjectionListOut = {
  resource: OmsProjectionResource;
  table_name?: string | null;
  columns: string[];
  items: OmsProjectionRow[];
  rows: OmsProjectionRow[];
  total: number;
  limit: number;
  offset: number;
};

export type OmsProjectionResourceStatus = Record<string, unknown>;

export type OmsProjectionStatusOut = {
  order_count: number;
  line_count: number;
  component_count: number;
  last_synced_at?: string | null;
  latest_run_status?: string | null;
  resources: OmsProjectionResourceStatus[];
  oms_api_base_url_configured: boolean;
  oms_api_token_configured: boolean;
};

export type OmsProjectionCheckOut = {
  ok: boolean;
  resource: OmsProjectionResource;
  checked_count?: number;
  issue_count: number;
  issues: OmsProjectionRow[];
};

export type OmsProjectionSyncOut = {
  ok: boolean;
  run_id?: number | string | null;
  status?: string | null;
  fetched?: number;
  upserted_orders?: number;
  upserted_lines?: number;
  upserted_components?: number;
  message?: string | null;
};

export type OmsProjectionSyncRun = {
  id: number | string;
  resource?: string | null;
  platform?: string | null;
  status?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  fetched?: number | null;
  upserted_orders?: number | null;
  upserted_lines?: number | null;
  upserted_components?: number | null;
  error_message?: string | null;
};

export type OmsProjectionSyncRunListOut = {
  items: OmsProjectionSyncRun[];
  runs: OmsProjectionSyncRun[];
  total: number;
  limit: number;
  offset: number;
};

export const OMS_PROJECTION_RESOURCE_LABELS: Record<OmsProjectionResource, string> = {
  orders: "订单投影",
  lines: "订单行投影",
  components: "履约组件投影",
};
