// src/features/shipping-assist/handoffs/api.ts

import { apiGet } from "../../../lib/api";
import type {
  ShippingHandoffListResponse,
  ShippingHandoffQuery,
} from "./types";

export async function fetchShippingHandoffs(
  query: ShippingHandoffQuery = {},
): Promise<ShippingHandoffListResponse> {
  const params: Record<string, string | number> = {
    limit: query.limit ?? 500,
    offset: query.offset ?? 0,
  };

  if (query.source_doc_type) params.source_doc_type = query.source_doc_type;
  if (query.export_status) params.export_status = query.export_status;
  if (query.logistics_status) params.logistics_status = query.logistics_status;
  if (query.source_ref) params.source_ref = query.source_ref;
  if (query.source_doc_no) params.source_doc_no = query.source_doc_no;
  if (query.logistics_request_no) {
    params.logistics_request_no = query.logistics_request_no;
  }

  return await apiGet<ShippingHandoffListResponse>(
    "/shipping-assist/handoffs",
    params,
  );
}
