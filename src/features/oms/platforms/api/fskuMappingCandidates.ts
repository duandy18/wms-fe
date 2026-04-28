import { apiGet } from "../../../../lib/api";

import type { OmsPlatformKey } from "./platformOrderMirrors";

export type MappingStatus = "bound" | "unbound" | "missing_merchant_code";

export interface FskuMappingCandidate {
  platform: string;

  mirror_id: number;
  line_id: number;
  collector_order_id: number;
  collector_line_id: number;

  store_code: string;
  collector_store_id: number;
  collector_store_name: string;

  platform_order_no: string;
  merchant_code?: string | null;
  platform_item_id?: string | null;
  platform_sku_id?: string | null;
  title?: string | null;
  quantity: string;
  line_amount?: string | null;

  is_bound: boolean;
  mapping_status: MappingStatus;

  binding_id?: number | null;
  fsku_id?: number | null;
  fsku_code?: string | null;
  fsku_name?: string | null;
  fsku_status?: string | null;
  binding_reason?: string | null;
  binding_updated_at?: string | null;
}

interface FskuMappingCandidateListData {
  items: FskuMappingCandidate[];
  total: number;
  limit: number;
  offset: number;
}

interface FskuMappingCandidateListEnvelope {
  ok: boolean;
  data: FskuMappingCandidateListData;
}

export interface ListFskuMappingCandidatesArgs {
  storeCode?: string;
  merchantCode?: string;
  onlyUnbound?: boolean;
  limit?: number;
  offset?: number;
}

function buildQuery(args: ListFskuMappingCandidatesArgs): string {
  const params = new URLSearchParams();

  if (args.storeCode?.trim()) params.set("store_code", args.storeCode.trim());
  if (args.merchantCode?.trim()) params.set("merchant_code", args.merchantCode.trim());
  if (args.onlyUnbound === true) params.set("only_unbound", "true");
  if (typeof args.limit === "number") params.set("limit", String(args.limit));
  if (typeof args.offset === "number") params.set("offset", String(args.offset));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listFskuMappingCandidates(
  platform: OmsPlatformKey,
  args: ListFskuMappingCandidatesArgs = {},
): Promise<FskuMappingCandidateListData> {
  const result = await apiGet<FskuMappingCandidateListEnvelope>(
    `/oms/${platform}/fsku-mapping/candidates${buildQuery(args)}`,
  );

  if (result.ok !== true) {
    throw new Error(`合同不匹配：GET /oms/${platform}/fsku-mapping/candidates.ok 非 true`);
  }

  return result.data;
}
