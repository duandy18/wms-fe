import { apiGet, apiPost } from "../../../../lib/api";

export type OmsPlatformKey = "pdd" | "taobao" | "jd";

export interface PlatformOrderMirrorLine {
  id: number;
  collector_line_id: number;
  collector_order_id: number;
  platform_order_no: string;
  merchant_sku?: string | null;
  platform_item_id?: string | null;
  platform_sku_id?: string | null;
  title?: string | null;
  quantity: string;
  unit_price?: string | null;
  line_amount?: string | null;
  platform_fields: Record<string, unknown>;
  raw_item_payload?: unknown;
}

export interface PlatformOrderMirror {
  id: number;
  collector_order_id: number;
  collector_store_id: number;
  collector_store_code: string;
  collector_store_name: string;
  wms_store_id?: number | null;
  platform: OmsPlatformKey;
  platform_order_no: string;
  platform_status?: string | null;
  import_status: string;
  mirror_status: string;
  source_updated_at?: string | null;
  pulled_at?: string | null;
  collector_last_synced_at?: string | null;
  imported_at?: string | null;
  last_synced_at?: string | null;
  receiver: Record<string, unknown>;
  amounts: Record<string, unknown>;
  platform_fields: Record<string, unknown>;
  raw_refs: Record<string, unknown>;
  lines: PlatformOrderMirrorLine[];
}

interface PlatformOrderMirrorEnvelope {
  ok: boolean;
  data: PlatformOrderMirror;
}

interface PlatformOrderMirrorListEnvelope {
  ok: boolean;
  data: PlatformOrderMirror[];
}

export interface ImportFromCollectorResult {
  ok: boolean;
  imported: boolean;
  platform: OmsPlatformKey;
  collector_order_id: number;
  mirror_id: number;
}

function assertOkEnvelope<T>(
  value: { ok: boolean; data: T },
  label: string,
): T {
  if (value.ok !== true) {
    throw new Error(`合同不匹配：${label}.ok 非 true`);
  }

  return value.data;
}

function assertImportResult(
  value: ImportFromCollectorResult,
  label: string,
): ImportFromCollectorResult {
  if (value.ok !== true || value.imported !== true) {
    throw new Error(`合同不匹配：${label} 返回导入失败`);
  }

  if (!Number.isFinite(value.mirror_id) || value.mirror_id <= 0) {
    throw new Error(`合同不匹配：${label}.mirror_id 非法`);
  }

  return value;
}

export async function importPlatformOrderMirrorFromCollector(
  platform: OmsPlatformKey,
  collectorOrderId: number,
): Promise<ImportFromCollectorResult> {
  const result = await apiPost<ImportFromCollectorResult>(
    `/oms/${platform}/platform-order-mirrors/import-from-collector`,
    {
      collector_order_id: collectorOrderId,
    },
  );

  return assertImportResult(
    result,
    `POST /oms/${platform}/platform-order-mirrors/import-from-collector`,
  );
}

export async function listPlatformOrderMirrors(
  platform: OmsPlatformKey,
): Promise<PlatformOrderMirror[]> {
  const result = await apiGet<PlatformOrderMirrorListEnvelope>(
    `/oms/${platform}/platform-order-mirrors`,
  );

  return assertOkEnvelope(result, `GET /oms/${platform}/platform-order-mirrors`);
}

export async function getPlatformOrderMirrorDetail(
  platform: OmsPlatformKey,
  mirrorId: number,
): Promise<PlatformOrderMirror> {
  const result = await apiGet<PlatformOrderMirrorEnvelope>(
    `/oms/${platform}/platform-order-mirrors/${mirrorId}`,
  );

  return assertOkEnvelope(
    result,
    `GET /oms/${platform}/platform-order-mirrors/{mirror_id}`,
  );
}
