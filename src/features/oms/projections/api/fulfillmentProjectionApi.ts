import { apiGet, apiPost } from "../../../../lib/api";

import type {
  OmsProjectionCheckOut,
  OmsProjectionListOut,
  OmsProjectionResource,
  OmsProjectionRow,
  OmsProjectionStatusOut,
  OmsProjectionSyncOut,
  OmsProjectionSyncRun,
  OmsProjectionSyncRunListOut,
} from "../types";

const BASE_PATH = "/oms/fulfillment-projection";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asRows(value: unknown): OmsProjectionRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function isProjectionResource(value: unknown): value is OmsProjectionResource {
  return value === "orders" || value === "lines" || value === "components";
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    qs.set(key, String(value));
  }
  const text = qs.toString();
  return text ? `?${text}` : "";
}

function normalizeListOut(
  raw: unknown,
  args: { resource: OmsProjectionResource; limit: number; offset: number },
): OmsProjectionListOut {
  if (!isRecord(raw)) {
    return {
      items: [],
      rows: [],
      columns: [],
      total: 0,
      limit: args.limit,
      offset: args.offset,
      resource: args.resource,
    };
  }

  const items = asRows(raw.items ?? raw.rows);
  return {
    items,
    rows: items,
    columns: asStringList(raw.columns),
    total: asNumber(raw.total, items.length),
    limit: asNumber(raw.limit, args.limit),
    offset: asNumber(raw.offset, args.offset),
    resource: isProjectionResource(raw.resource) ? raw.resource : args.resource,
    table_name: asString(raw.table_name),
  };
}

function normalizeStatusOut(raw: unknown): OmsProjectionStatusOut {
  if (!isRecord(raw)) {
    return {
      order_count: 0,
      line_count: 0,
      component_count: 0,
      resources: [],
      oms_api_base_url_configured: false,
      oms_api_token_configured: false,
    };
  }

  const resources = Array.isArray(raw.resources) ? raw.resources.filter(isRecord) : [];
  let orderCount = 0;
  let lineCount = 0;
  let componentCount = 0;
  let lastSyncedAt: string | null = null;
  let latestRunStatus: string | null = null;

  for (const item of resources) {
    const resource = item.resource;
    const rowCount = asNumber(item.row_count, 0);

    if (resource === "orders") orderCount = rowCount;
    if (resource === "lines") lineCount = rowCount;
    if (resource === "components") componentCount = rowCount;

    const syncedAt = asString(item.max_synced_at);
    if (syncedAt && (lastSyncedAt == null || syncedAt > lastSyncedAt)) {
      lastSyncedAt = syncedAt;
    }

    if (latestRunStatus == null && isRecord(item.last_sync_run)) {
      latestRunStatus = asString(item.last_sync_run.status);
    }
  }

  return {
    order_count: orderCount,
    line_count: lineCount,
    component_count: componentCount,
    last_synced_at: lastSyncedAt,
    latest_run_status: latestRunStatus,
    resources,
    oms_api_base_url_configured: asBoolean(raw.oms_api_base_url_configured),
    oms_api_token_configured: asBoolean(raw.oms_api_token_configured),
  };
}

function normalizeSyncRun(row: unknown): OmsProjectionSyncRun | null {
  if (!isRecord(row)) return null;
  const id = row.id;
  if (typeof id !== "number" && typeof id !== "string") return null;

  return {
    id,
    resource: asString(row.resource),
    platform: asString(row.platform),
    status: asString(row.status),
    started_at: asString(row.started_at),
    finished_at: asString(row.finished_at),
    fetched: asNumber(row.fetched, 0),
    upserted_orders: asNumber(row.upserted_orders, 0),
    upserted_lines: asNumber(row.upserted_lines, 0),
    upserted_components: asNumber(row.upserted_components, 0),
    error_message: asString(row.error_message),
  };
}

function normalizeSyncRunsOut(
  raw: unknown,
  args: { limit: number; offset: number },
): OmsProjectionSyncRunListOut {
  if (!isRecord(raw)) {
    return { items: [], runs: [], total: 0, limit: args.limit, offset: args.offset };
  }

  const runs = (Array.isArray(raw.items) ? raw.items : Array.isArray(raw.runs) ? raw.runs : [])
    .map(normalizeSyncRun)
    .filter((item): item is OmsProjectionSyncRun => item !== null);

  return {
    items: runs,
    runs,
    total: asNumber(raw.total, runs.length),
    limit: asNumber(raw.limit, args.limit),
    offset: asNumber(raw.offset, args.offset),
  };
}

function normalizeSyncOut(raw: unknown): OmsProjectionSyncOut {
  const envelope = isRecord(raw) ? raw : {};
  const run = isRecord(envelope.run) ? envelope.run : envelope;

  return {
    ok: asBoolean(envelope.ok, true),
    run_id: typeof run.id === "number" || typeof run.id === "string" ? run.id : null,
    status: asString(run.status),
    fetched: asNumber(run.fetched, 0),
    upserted_orders: asNumber(run.upserted_orders, 0),
    upserted_lines: asNumber(run.upserted_lines, 0),
    upserted_components: asNumber(run.upserted_components, 0),
    message: asString(envelope.message),
  };
}

function normalizeCheckOut(raw: unknown, resource: OmsProjectionResource): OmsProjectionCheckOut {
  if (!isRecord(raw)) {
    return { ok: false, resource, checked_count: 0, issue_count: 0, issues: [] };
  }

  const issues = asRows(raw.issues);
  return {
    ok: asBoolean(raw.ok),
    resource: isProjectionResource(raw.resource) ? raw.resource : resource,
    checked_count: asNumber(raw.checked_count, 0),
    issue_count: asNumber(raw.issue_count, issues.length),
    issues,
  };
}

export async function getOmsProjectionStatus(): Promise<OmsProjectionStatusOut> {
  const raw = await apiGet<unknown>(`${BASE_PATH}/status`);
  return normalizeStatusOut(raw);
}

export async function listOmsProjectionRows(args: {
  resource: OmsProjectionResource;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<OmsProjectionListOut> {
  const limit = args.limit ?? 20;
  const offset = args.offset ?? 0;
  const query = buildQuery({
    q: args.q,
    limit,
    offset,
  });
  const raw = await apiGet<unknown>(`${BASE_PATH}/projections/${args.resource}${query}`);
  return normalizeListOut(raw, { resource: args.resource, limit, offset });
}

export async function checkOmsProjectionResource(
  resource: OmsProjectionResource,
): Promise<OmsProjectionCheckOut> {
  const raw = await apiPost<unknown>(`${BASE_PATH}/projections/${resource}/check`, {});
  return normalizeCheckOut(raw, resource);
}

export async function syncOmsFulfillmentReadyOrders(args: {
  platform?: string;
  store_code?: string;
} = {}): Promise<OmsProjectionSyncOut> {
  const query = buildQuery({
    platform: args.platform,
    store_code: args.store_code,
  });
  const raw = await apiPost<unknown>(
    `${BASE_PATH}/projections/fulfillment-ready-orders/sync${query}`,
    {},
  );
  return normalizeSyncOut(raw);
}

export async function listOmsProjectionSyncRuns(args: {
  platform?: string;
  resource?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<OmsProjectionSyncRunListOut> {
  const limit = args.limit ?? 10;
  const offset = args.offset ?? 0;
  const query = buildQuery({
    platform: args.platform,
    resource: args.resource,
    limit,
    offset,
  });
  const raw = await apiGet<unknown>(`${BASE_PATH}/sync-runs${query}`);
  return normalizeSyncRunsOut(raw, { limit, offset });
}
