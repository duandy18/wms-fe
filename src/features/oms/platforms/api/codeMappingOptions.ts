import { apiGet } from "../../../../lib/api";

import type { OmsPlatformKey } from "./platformOrderMirrors";

export interface CodeMappingOption {
  platform: string;
  store_code: string;
  merchant_code: string;

  latest_title?: string | null;
  platform_item_id?: string | null;
  platform_sku_id?: string | null;
  latest_platform_order_no?: string | null;
  latest_synced_at?: string | null;

  orders_count: number;

  is_bound: boolean;
  binding_id?: number | null;
  fsku_id?: number | null;
  fsku_code?: string | null;
  fsku_name?: string | null;
  fsku_status?: string | null;
  binding_updated_at?: string | null;
}

interface CodeMappingOptionListData {
  items: CodeMappingOption[];
  total: number;
  limit: number;
  offset: number;
}

interface CodeMappingOptionListEnvelope {
  ok: boolean;
  data: CodeMappingOptionListData;
}

export interface ListCodeMappingOptionsArgs {
  storeCode?: string;
  merchantCode?: string;
  onlyUnbound?: boolean;
  limit?: number;
  offset?: number;
}

function buildQuery(args: ListCodeMappingOptionsArgs): string {
  const params = new URLSearchParams();

  if (args.storeCode?.trim()) params.set("store_code", args.storeCode.trim());
  if (args.merchantCode?.trim()) params.set("merchant_code", args.merchantCode.trim());
  if (args.onlyUnbound === true) params.set("only_unbound", "true");
  if (typeof args.limit === "number") params.set("limit", String(args.limit));
  if (typeof args.offset === "number") params.set("offset", String(args.offset));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listCodeMappingOptions(
  platform: OmsPlatformKey,
  args: ListCodeMappingOptionsArgs = {},
): Promise<CodeMappingOptionListData> {
  const result = await apiGet<CodeMappingOptionListEnvelope>(
    `/oms/${platform}/code-mapping/code-options${buildQuery(args)}`,
  );

  if (result.ok !== true) {
    throw new Error(`合同不匹配：GET /oms/${platform}/code-mapping/code-options.ok 非 true`);
  }

  return result.data;
}
